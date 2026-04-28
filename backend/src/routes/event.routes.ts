import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { eventCoverUpload } from "../middlewares/upload.js";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

// Routes publiques (catalogue) — pas d’authentification
router.get("/public", eventController.listPublic);
router.get("/public/:id", eventController.getPublicById);

// Routes protégées organisateur/admin
router.use(authenticate);

// Dashboard KPIs organisateur
router.get("/dashboard/kpis", authorize("ORGANIZER", "ADMIN"), eventController.dashboardKpis);

// Upload cover image
router.post(
    "/upload/cover",
    authorize("ORGANIZER", "ADMIN"),
    eventCoverUpload.single("file"),
    eventController.uploadCover,
);

// Créer un événement (ORGANIZER ou ADMIN)
router.post("/", authorize("ORGANIZER", "ADMIN"), eventController.create);

// Lister les événements de l’organisateur connecté
router.get("/", authorize("ORGANIZER", "ADMIN"), eventController.listByOrganizer);

// Détail d’un événement (vérifie appartenance via service)
router.get("/:id", authorize("ORGANIZER", "ADMIN"), eventController.getById);

// Mettre à jour le statut d'un événement
router.patch("/:id/status", authorize("ORGANIZER", "ADMIN"), eventController.updateStatus);

export default router;
