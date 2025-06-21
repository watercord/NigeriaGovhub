// src/types/next-auth.d.ts
import type { DefaultSession, User as NextAuthUser } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';

// Define your custom user role type
type UserRole = 'user' | 'admin' | null;

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user']; // Extends default user properties (name, email, image)
  }

  /** The OAuth profile returned from your provider or the user object from the database */
  interface User extends NextAuthUser {
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends NextAuthJWT {
    id: string;
    role: UserRole;
  }
}
