import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

// Toutes les routes nécessitent d’être connecté
router.use(authenticate);

// Créer un événement (ORGANIZER ou ADMIN)
router.post("/", authorize("ORGANIZER", "ADMIN"), eventController.create);

// Lister les événements de l’organisateur connecté
router.get("/", authorize("ORGANIZER", "ADMIN"), eventController.listByOrganizer);

// Détail d’un événement (vérifie appartenance via service)
router.get("/:id", authorize("ORGANIZER", "ADMIN"), eventController.getById);

export default router;
