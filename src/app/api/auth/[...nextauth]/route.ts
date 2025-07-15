import NextAuth, { AuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { user } from '@/db/schema';
import { db } from '@/db/drizzle';
import { DefaultUser, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types/next-auth';

// Define the getFullUserByEmail function using Drizzle
export const getFullUserByEmail = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return result[0] || null;
  } catch {
    return null;
  }
};

// Define providers
const providers = [
  // GoogleProvider({
  //   clientId: process.env.GOOGLE_CLIENT_ID as string,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  // }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, req) {
      try {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required.');
        }

        const userFromDb = await getFullUserByEmail(credentials.email);
        if (!userFromDb || !userFromDb.password) {
          throw new Error('Invalid email or password.');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, userFromDb.password);
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
      } catch (err) {
        console.error('[CredentialsProvider][AuthorizeError]', err);
        throw new Error('Failed to authorize. Please try again.');
      }
    },
  }),
];

export const authOptions: AuthOptions & { trustHost: boolean } = {
  adapter: DrizzleAdapter(db) as any,
  providers: providers,
  session: {
    strategy: 'jwt',
  },

  trustHost: true,
  pages: {
    signIn: '/login',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
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
      if (user) {
        token.id = user.id ?? '';
        token.role = (user.role as UserRole) ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole ?? 'user';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };