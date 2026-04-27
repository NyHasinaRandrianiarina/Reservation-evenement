import type { Request, Response, NextFunction } from "express";
import type { Role } from "../types/express.js";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.js";

/**
 * Middleware factory d'autorisation par rôle.
 *
 * Vérifie que l'utilisateur authentifié possède l'un des rôles autorisés.
 * Doit être utilisé APRÈS le middleware `authenticate`.
 *
 * @example
 * router.get("/admin/dashboard", authenticate, authorize("ADMIN"), adminDashboard);
 * router.get("/shop/products", authenticate, authorize("SELLER", "ADMIN"), getProducts);
 */
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentification requise");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        "Vous n'avez pas les permissions nécessaires pour cette action"
      );
    }

    next();
  };
};
