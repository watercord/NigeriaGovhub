// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db/drizzle';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types/next-auth';

type Credentials = {
  email: string;
  password: string;
};

export const getFullUserByEmail = async (email: string) => {
  try {
    console.log('Fetching user by email:', email); // Debug
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getFullUserByEmail:', error);
    return null;
  }
};

export const authOptions: NextAuthOptions & { trustHost: boolean } = {
  adapter: DrizzleAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined, req) {
        try {
          console.log('Authorize called:', { credentials, query: req.query }); // Debug
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required.');
          }
          const userFromDb = await getFullUserByEmail(credentials.email);
          if (!userFromDb || !userFromDb.password) {
            throw new Error('Invalid email or password.');
          }
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            userFromDb.password
          );
          if (!isValidPassword) {
            throw new Error('Invalid email or password.');
          }
          if (!userFromDb.emailVerified) {
            throw new Error('Email not verified. Please check your inbox.');
          }
          return {
            id: userFromDb.id,
            name: userFromDb.name,
            email: userFromDb.email,
            image: userFromDb.image,
            role: userFromDb.role as UserRole,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw error; // Let NextAuth handle the error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][Error]', code, metadata);
    },
    warn(code) {
      console.warn('[NextAuth][Warn]', code);
    },
    debug(code, metadata) {
      console.debug('[NextAuth][Debug]', code, metadata);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user }); // Debug
      if (user) {
        token.id = user.id ?? '';
        token.role = (user.role as UserRole) ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token }); // Debug
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};