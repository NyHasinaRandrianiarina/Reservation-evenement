import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { createEvent, getEventsByOrganizer, getEventByIdAndOrganizer, getPublicEvents, getPublicEventByIdOrSlug, getOrganizerDashboardKpis, updateEventStatus, updateEvent, deleteEvent } from "../services/event.service.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * Crée un événement (protégé organisateur/admin)
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const event = await createEvent(organizer.id, req.body);
  ApiResponse.created(res, event, "Événement créé avec succès");
});

/**
 * Liste les événements créés par l’organisateur connecté
 */
export const listByOrganizer = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const events = await getEventsByOrganizer(organizer.id);
  ApiResponse.success(res, events, "Événements récupérés");
});

/**
 * Détail d’un événement (vérifie appartenance)
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const eventId = String(req.params.id);
  const event = await getEventByIdAndOrganizer(eventId, organizer.id);

  if (!event) {
    return ApiResponse.error(res, "Événement introuvable", 404);
  }

  ApiResponse.success(res, event, "Événement récupéré");
});

/**
 * Met à jour le statut d'un événement
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const eventId = String(req.params.id);
  const { status } = req.body;

  if (!status || !['draft', 'published', 'cancelled'].includes(status)) {
    return ApiResponse.error(res, "Statut invalide", 400);
  }

  const updatedEvent = await updateEventStatus(eventId, organizer.id, status);

  if (!updatedEvent) {
    return ApiResponse.error(res, "Événement introuvable ou non autorisé", 404);
  }

  ApiResponse.success(res, updatedEvent, "Statut de l'événement mis à jour");
});

/**
 * Met à jour un événement (ownership)
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const eventId = String(req.params.id);

  const updated = await updateEvent(eventId, organizer.id, req.body);
  if (!updated) {
    return ApiResponse.error(res, "Événement introuvable ou non autorisé", 404);
  }

  ApiResponse.success(res, updated, "Événement mis à jour");
});

/**
 * Supprime un événement (ownership)
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const eventId = String(req.params.id);

  const ok = await deleteEvent(eventId, organizer.id);
  if (!ok) {
    return ApiResponse.error(res, "Événement introuvable ou non autorisé", 404);
  }

  ApiResponse.success(res, null, "Événement supprimé");
});

/**
 * Liste tous les événements publics (catalogue)
 */
export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const organizer_id = typeof req.query.organizer_id === "string" ? req.query.organizer_id : undefined;
  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const limit = Number.isFinite(limitRaw as number) ? (limitRaw as number) : undefined;

  const filters: { organizer_id?: string; limit?: number } = {};
  if (organizer_id) filters.organizer_id = organizer_id;
  if (limit !== undefined) filters.limit = limit;

  const events = await getPublicEvents(filters);
  ApiResponse.success(res, events, "Événements publics récupérés");
});

/**
 * Détail d’un événement public (catalogue)
 */
export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const eventId = String(req.params.id);
  const event = await getPublicEventByIdOrSlug(eventId);

  if (!event) {
    return ApiResponse.error(res, "Événement introuvable", 404);
  }

  ApiResponse.success(res, event, "Événement public récupéré");
});

/**
 * KPIs du dashboard organisateur
 */
export const dashboardKpis = asyncHandler(async (req: Request, res: Response) => {
  const organizer = req.user!;
  const kpis = await getOrganizerDashboardKpis(organizer.id);
  ApiResponse.success(res, kpis, "KPIs récupérés");
});

/**
 * Upload image de couverture (stockée sur le serveur)
 */
export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return ApiResponse.error(res, "Aucun fichier reçu", 400);
  }

  const uploaded = await uploadToCloudinary(file.buffer, "events/covers");

  ApiResponse.created(
    res,
    { url: uploaded.url, public_id: uploaded.public_id },
    "Image uploadée"
  );
});
