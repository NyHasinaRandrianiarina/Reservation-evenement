import { Prisma } from "@prisma/client";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "./app-error.js";

/**
 * Transforme une erreur Prisma en AppError typée
 * pour que le error-handler puisse renvoyer un message clair au client.
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export function handlePrismaError(error: unknown): AppError {
  // ── PrismaClientKnownRequestError ──
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      // Violation de contrainte unique (ex: email déjà utilisé)
      case "P2002": {
        const target = (error.meta?.["target"] as string[] | undefined) ?? [];
        const fields = target.join(", ");
        return new ConflictError(
          fields
            ? `La valeur de "${fields}" est déjà utilisée`
            : "Cette ressource existe déjà"
        );
      }

      // Enregistrement introuvable
      case "P2025": {
        const cause =
          (error.meta?.["cause"] as string | undefined) ?? "Enregistrement";
        return new NotFoundError(`${cause} introuvable`);
      }

      // Violation de clé étrangère
      case "P2003": {
        const field =
          (error.meta?.["field_name"] as string | undefined) ?? "relation";
        return new BadRequestError(
          `Référence invalide sur le champ "${field}"`
        );
      }

      // Violation de relation requise
      case "P2014": {
        return new BadRequestError(
          "Cette opération violerait une relation requise entre les modèles"
        );
      }

      // Valeur trop longue
      case "P2000": {
        const column =
          (error.meta?.["column_name"] as string | undefined) ?? "champ";
        return new BadRequestError(
          `La valeur fournie pour "${column}" est trop longue`
        );
      }

      default:
        return new AppError(
          `Erreur base de données (${error.code})`,
          500,
          false
        );
    }
  }

  // ── PrismaClientValidationError (mauvais types dans la query) ──
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError(
      "Données invalides envoyées à la base de données"
    );
  }

  // ── PrismaClientInitializationError ──
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      "Impossible de se connecter à la base de données",
      503,
      false
    );
  }

  // ── Fallback ──
  return new AppError("Erreur interne du serveur", 500, false);
}
