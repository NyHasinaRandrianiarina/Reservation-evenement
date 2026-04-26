import { body } from "express-validator";

export const createShopValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom de la boutique est requis")
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom de la boutique doit faire entre 2 et 100 caractères"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La description ne doit pas dépasser 1000 caractères"),

  body("logo_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("L'URL du logo doit être valide"),
];
