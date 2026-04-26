import type { Request, Response, NextFunction } from "express";

/**
 * Enveloppe un controller async dans un try/catch automatique.
 * En cas d'erreur, elle est passée à next() → error-handler global.
 *
 * @example
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await prisma.user.findMany();
 *   ApiResponse.success(res, users, "Utilisateurs récupérés");
 * });
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
