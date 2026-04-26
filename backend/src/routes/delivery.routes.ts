import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = Router();

const createDeliveryValidation = [
  body("description").isString().isLength({ min: 3 }).withMessage("La description est trop courte"),
  body("weight").optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage("Le poids doit être un nombre"),
  body("pickup_address").isString().isLength({ min: 5 }).withMessage("L'adresse de collecte est requise"),
  body("delivery_address").isString().isLength({ min: 5 }).withMessage("L'adresse de livraison est requise"),
  body("recipient_name").isString().isLength({ min: 2 }).withMessage("Le nom du destinataire est requis"),
  body("recipient_phone").isString().isLength({ min: 8 }).withMessage("Le numéro de téléphone est invalide"),
];

const assignDriverValidation = [
  body("driver_id").isString().notEmpty().withMessage("L'ID du livreur est requis"),
];

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// --- SENDER ---
router.post(
  "/",
  authorize("SENDER"),
  validate(createDeliveryValidation),
  deliveryController.create
);

// --- ADMIN ---
router.get(
  "/",
  authorize("ADMIN"),
  deliveryController.listAll
);

router.get(
  "/drivers",
  authorize("ADMIN"),
  deliveryController.listDrivers
);

router.patch(
  "/:id/assign",
  authorize("ADMIN"),
  validate(assignDriverValidation),
  deliveryController.assign
);

export default router;
