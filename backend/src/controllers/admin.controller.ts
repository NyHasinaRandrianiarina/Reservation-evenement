import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  getAdminStats,
  getAllEventsAdmin,
  adminUpdateEventStatus,
  adminDeleteEvent,
  getAllUsersAdmin,
  toggleUserStatus,
} from "../services/admin.service.js";

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminStats();
  ApiResponse.success(res, stats, "Statistiques récupérées");
});

export const listAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const filters: Parameters<typeof getAllEventsAdmin>[0] = {};
  if (str(q.status)) filters.status = str(q.status);
  if (str(q.category)) filters.category = str(q.category);
  if (str(q.organizer_id)) filters.organizer_id = str(q.organizer_id);
  if (str(q.search)) filters.search = str(q.search);
  if (str(q.page)) filters.page = Number(q.page);
  if (str(q.limit)) filters.limit = Number(q.limit);

  const result = await getAllEventsAdmin(filters);
  ApiResponse.success(res, result, "Événements récupérés");
});

export const updateEventStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const allowed = ["draft", "published", "cancelled"];
  if (!status || !allowed.includes(status)) {
    return ApiResponse.error(res, "Statut invalide", 400);
  }

  const event = await adminUpdateEventStatus(id, status);
  ApiResponse.success(res, event, "Statut de l'événement mis à jour");
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await adminDeleteEvent(id);
  ApiResponse.success(res, null, "Événement supprimé");
});

export const listAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const filters: Parameters<typeof getAllUsersAdmin>[0] = {};
  if (str(q.role)) filters.role = str(q.role);
  if (str(q.search)) filters.search = str(q.search);
  if (str(q.status)) filters.status = str(q.status);
  if (str(q.page)) filters.page = Number(q.page);
  if (str(q.limit)) filters.limit = Number(q.limit);

  const result = await getAllUsersAdmin(filters);
  ApiResponse.success(res, result, "Utilisateurs récupérés");
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return ApiResponse.error(res, "is_active doit être un booléen", 400);
  }

  const user = await toggleUserStatus(id, is_active);
  ApiResponse.success(res, user, is_active ? "Compte réactivé" : "Compte suspendu");
});

