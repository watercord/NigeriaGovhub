import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` declarations in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
