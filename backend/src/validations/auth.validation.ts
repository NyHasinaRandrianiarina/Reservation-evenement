import { body } from "express-validator";

// Inscription
export const registerValidation = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Le nom complet est requis")
    .isLength({ min: 2, max: 120 })
    .withMessage("Le nom complet doit faire entre 2 et 120 caractères"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit faire au moins 6 caractères"),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage("Numéro de téléphone invalide"),

  body("role")
    .optional()
    .isIn(["PARTICIPANT", "ORGANIZER", "ADMIN"])
    .withMessage("Rôle invalide"),
];

// Les validation pour le login

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide"),

  body("password").notEmpty().withMessage("Le mot de passe est requis"),
];

// Validation pour la 2FA (Vérification)

export const verify2faValidation = [
  body("temp_token")
    .notEmpty()
    .withMessage("Le token temporaire est requis"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Le code OTP est requis")
    .isLength({ min: 6, max: 6 })
    .withMessage("Le code OTP doit faire 6 chiffres")
    .isNumeric()
    .withMessage("Le code OTP doit être numérique"),
];

// Confirmation 2FA

export const confirm2faValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Le code OTP est requis")
    .isLength({ min: 6, max: 6 })
    .withMessage("Le code OTP doit faire 6 chiffres")
    .isNumeric()
    .withMessage("Le code OTP doit être numérique"),
];
