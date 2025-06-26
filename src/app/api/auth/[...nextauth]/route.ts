
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { AuthOptions, Session as NextAuthSession } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import { getFullUserByEmail } from '@/lib/data';

// Define missing types
export type UserRole = 'user' | 'admin';

export interface NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | null;
  image?: string | null;
  created_at?: Date | null;
}

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

  // Type assertion to include password property
  const userWithPassword = userFromDb as (typeof userFromDb & { password?: string });

  if (!userWithPassword || !userWithPassword.password) {
    throw new Error('Invalid email or password.');
  }

  const isValidPassword = await bcrypt.compare(credentials.password as string, userWithPassword.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password.');
  }

  if (!userFromDb || !userFromDb.emailVerified) {
    throw new Error('Email not verified. Please check your inbox.');
  }

  // Ensure returned user matches NextAuth User type
  return {
    id: userFromDb.id,
    name: userFromDb.name ?? null,
    email: userFromDb.email ?? null,
    role: (userFromDb.role as UserRole) ?? 'user', // explicitly cast to UserRole
    image: userFromDb.image ?? null,
    created_at: userFromDb.created_at ?? null,
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
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | null;
      }
      return session;
    },
  },
} as AuthOptions;


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
