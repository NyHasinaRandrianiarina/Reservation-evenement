import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { createEvent, getEventsByOrganizer, getEventByIdAndOrganizer, getPublicEvents, getPublicEventById, getOrganizerDashboardKpis, updateEventStatus } from "../services/event.service.js";

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
 * Liste tous les événements publics (catalogue)
 */
export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const events = await getPublicEvents();
  ApiResponse.success(res, events, "Événements publics récupérés");
});

/**
 * Détail d’un événement public (catalogue)
 */
export const getPublicById = asyncHandler(async (req: Request, res: Response) => {
  const eventId = String(req.params.id);
  const event = await getPublicEventById(eventId);

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
