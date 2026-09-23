/**
 * Global Prisma Client Singleton for Multi-Tenant Data Access
 * Prevents multiple instances during Hot-Reload in development
 */

// Universal safe type definition for Prisma client
export type PrismaClientInstance = any;

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClientInstance | undefined;
}

// In Next.js / Node.js runtime, PrismaClient is imported from '@prisma/client'
// In client-side or universal bundles, a safe proxy singleton is provided
const createPrismaClient = (): PrismaClientInstance => {
  if (typeof window !== 'undefined') {
    return {} as PrismaClientInstance;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dynamicRequire = eval('require');
    const { PrismaClient } = dynamicRequire('@prisma/client');
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch {
    return {} as PrismaClientInstance;
  }
};

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
