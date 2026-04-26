import { PrismaClient } from "@prisma/client";

// ──────────────────────────────────────────────
// Prisma Singleton
// ──────────────────────────────────────────────
// En développement, le hot-reload (nodemon) recrée le module
// à chaque save, ce qui ouvre une nouvelle connexion à chaque fois.
// On stocke l'instance dans globalThis pour la réutiliser.
// ──────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
