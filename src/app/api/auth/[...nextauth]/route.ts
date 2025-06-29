
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { AuthOptions, User as NextAuthUser, Session as NextAuthSession } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import { getFullUserByEmail } from '@/lib/data';
import type { UserRole } from '@/types/next-auth';

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

      const userFromDb = await getFullUserByEmail(credentials.email);

      if (!userFromDb || !userFromDb.password) {
        // User not found or password not set (e.g., OAuth user trying credentials)
        throw new Error('Invalid email or password.');
      }

      const isValidPassword = await bcrypt.compare(credentials.password, userFromDb.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password.');
      }

      if (!userFromDb.emailVerified) {
        throw new Error('Email not verified. Please check your inbox.');
      }

      // Return a plain, serializable object to prevent JWT errors
      return {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        image: userFromDb.image,
        role: userFromDb.role as UserRole,
      };
    }
  }),
  // FacebookProvider will be added here
];

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error', // A custom error page
    // verifyRequest: '/auth/verify-request', // A custom page for checking email
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
