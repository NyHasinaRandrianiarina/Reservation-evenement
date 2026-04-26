import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/app-error.js";
import { verifyAccessToken } from "../services/token.service.js";
import { getUserById } from "../services/auth.service.js";

/**
 * Middleware d'authentification.
 *
 * 1. Lit le cookie `access_token`
 * 2. Vérifie le JWT
 * 3. Charge l'utilisateur depuis la base
 * 4. Attache `req.user` à la requête
 *
 * @throws UnauthorizedError si le token est absent, invalide ou l'utilisateur inexistant.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.access_token as string | undefined;

  if (!token) {
    throw new UnauthorizedError("Authentification requise");
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await getUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedError("Utilisateur introuvable");
    }

    req.user = user;
    next();
  } catch {
    throw new UnauthorizedError("Token invalide ou expiré");
  }
};
