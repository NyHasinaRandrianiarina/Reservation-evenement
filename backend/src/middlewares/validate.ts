import type { Request, Response, NextFunction } from "express";
import {
  validationResult,
  type ValidationChain,
} from "express-validator";
import { ValidationError } from "../errors/app-error.js";

/**
 * Middleware de validation centralisé.
 *
 * Exécute les ValidationChain d'express-validator puis vérifie les résultats.
 * En cas d'erreur, lance une ValidationError (422) avec le détail par champ.
 *
 * @example
 * // dans auth.routes.ts
 * import { body } from "express-validator";
 * import { validate } from "../middlewares/validate.js";
 *
 * const registerValidation = [
 *   body("email").isEmail().withMessage("Email invalide"),
 *   body("password").isLength({ min: 6 }).withMessage("6 caractères minimum"),
 * ];
 *
 * router.post("/register", validate(registerValidation), register);
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Exécuter toutes les validations en parallèle
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    // Mapper vers notre format FieldError
    const fieldErrors = errors.array().map((err) => ({
      field: "type" in err && err.type === "field" ? (err as { path: string }).path : "unknown",
      message: err.msg as string,
    }));

    throw new ValidationError(fieldErrors);
  };
};
