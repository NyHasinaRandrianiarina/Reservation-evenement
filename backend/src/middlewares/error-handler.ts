import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { handlePrismaError } from "../errors/prisma-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { NODE_ENV } from "../secrets.js";

/**
 * Middleware global de gestion d'erreurs.
 * DOIT être le DERNIER middleware enregistré sur l'app Express.
 *
 * Flux :
 * 1. Si l'erreur est une erreur Prisma → la convertir en AppError
 * 2. Si AppError (opérationnelle) → renvoyer le format standardisé
 * 3. Sinon → erreur inattendue, log + réponse 500 générique
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── 1. Convertir les erreurs Prisma ──
  let error: AppError | Error = err;

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    error = handlePrismaError(err);
  }

  // ── 2. Erreur opérationnelle (AppError) ──
  if (error instanceof AppError) {
    ApiResponse.error(res, error.message, error.statusCode, error.errors);
    return;
  }

  // ── 3. Erreur inattendue ──
  console.error("Erreur inattendue :", err);

  const message =
    NODE_ENV === "development"
      ? err.message
      : "Une erreur interne est survenue";

  const body: Record<string, unknown> = {
    success: false,
    message,
  };

  if (NODE_ENV === "development" && err.stack) {
    body["stack"] = err.stack;
  }

  res.status(500).json(body);
};
