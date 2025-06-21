
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { AuthOptions, User as NextAuthUser, Session as NextAuthSession } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';

// Define providers here as you add them
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials.password) {
        throw new Error('Email and password are required.');
      }

      const userFromDb = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!userFromDb || !userFromDb.password) {
        // User not found or password not set (e.g., OAuth user trying credentials)
        throw new Error('Invalid email or password.');
      }

      const isValidPassword = await bcrypt.compare(credentials.password as string, userFromDb.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password.');
      }

      const roleFromDb = userFromDb.role;
      let finalRole: import('next-auth').User['role']; // This will be UserRole ('user' | 'admin' | null)

      if (roleFromDb === 'user' || roleFromDb === 'admin') {
        finalRole = roleFromDb;
      } else if (roleFromDb === null) {
        // If role being null means they are a standard user, or if it's an error state
        // Based on your previous logic: throw new Error('User role is missing.');
        // If null means 'user': finalRole = 'user';
        // For now, aligning with UserRole allowing null:
        finalRole = null;
        // However, your check `if (!userFromDb.role)` previously threw an error for null.
        // If a user *must* have a role ('user' or 'admin') from credentials login:
        // throw new Error('User role is missing or invalid in database.');
      } else {
        // Role is some other string, which is invalid according to UserRole
        throw new Error(`Invalid role value "${roleFromDb}" from database.`);
      }

      // If the logic implies that a user from Credentials provider MUST have a role from ('user', 'admin')
      // and null is not allowed from this path, then the earlier throw for null is better.
      // For now, let's assume `finalRole` is now correctly typed as `UserRole`
      // and your UserRole type includes null.

      if (userFromDb.role !== 'user' && userFromDb.role !== 'admin') {
           // This ensures that only 'user' or 'admin' are passed.
           // If userFromDb.role is null, and your UserRole type allows null, this check needs adjustment
           // or the UserRole type should not allow null if credentials users must have a non-null role.
           // Given `if (!userFromDb.role)` previously threw, let's assume credentials must be 'user' or 'admin'.
           throw new Error('User role is not "user" or "admin".');
      }


      return {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        image: userFromDb.image,
        role: userFromDb.role as ('user' | 'admin'), // Strict to 'user' or 'admin' from credentials
      };
    }
  }),
  // FacebookProvider will be added here
];

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user?: NextAuthUser }) {
      // user is the object from authorize or OAuth provider
      // token is the JWT object (potentially augmented by next-auth.d.ts)
      if (user) {
        token.id = user.id;
        // user.role here refers to the augmented User type from next-auth.d.ts
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: NextAuthSession; token: NextAuthJWT }) {
      // session is the Session object (potentially augmented)
      // token is the JWT object (potentially augmented)
      if (session.user && token.id) { // check token.id existence
        session.user.id = token.id as string;
        if (token.role) { // check token.role existence
            session.user.role = token.role as ('user' | 'admin' | null); // Cast to the defined UserRole
        } else {
            session.user.role = null; // Default if not on token
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
