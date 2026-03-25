import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });

// Singleton en dev ET en production (évite les reconnexions sur Vercel serverless)
globalForPrisma.prisma = prisma;

/**
 * Utilitaire de déconnexion propre pour les scripts CLI
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
