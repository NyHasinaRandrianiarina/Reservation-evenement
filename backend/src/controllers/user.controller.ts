import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { NotFoundError } from "../errors/app-error.js";
import {
  approveOrganizerAccount,
  getOrganizerById,
  getOrganizers,
  getPendingOrganizers,
} from "../services/user.service.js";
import { createNotificationForUser } from "../services/notification.service.js";

function toPublicOrganizer(u: {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  _count?: { events: number };
}) {
  return {
    id: u.id,
    name: u.full_name,
    email: u.email,
    avatar: u.avatar_url ?? undefined,
    bio: "",
    _count: u._count ?? { events: 0 },
  };
}

/**
 * Public: liste des organisateurs
 */
export const listOrganizers = asyncHandler(async (_req: Request, res: Response) => {
  const organizers = await getOrganizers();
  ApiResponse.success(res, organizers.map(toPublicOrganizer), "Organisateurs récupérés");
});

/**
 * Public: détail organisateur
 */
export const getOrganizer = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const organizer = await getOrganizerById(id);
  if (!organizer) {
    return ApiResponse.error(res, "Organisateur introuvable", 404);
  }

  ApiResponse.success(res, toPublicOrganizer(organizer), "Organisateur récupéré");
});

export const listPendingOrganizers = asyncHandler(async (_req: Request, res: Response) => {
  const pending = await getPendingOrganizers();
  ApiResponse.success(res, pending, "Organisateurs en attente récupérés");
});

export const approveOrganizer = asyncHandler(async (req: Request, res: Response) => {
  const organizerId = String(req.params.id);
  const result = await approveOrganizerAccount(organizerId);

  if (result.count === 0) {
    throw new NotFoundError("Organisateur en attente introuvable");
  }

  await createNotificationForUser(organizerId, {
    type: "organizer_approved",
    title: "Compte organisateur validé",
    message: "Votre compte a été validé par un administrateur. Vous pouvez maintenant publier des événements.",
    metadata: {
      organizer_id: organizerId,
    },
  });

  ApiResponse.success(res, null, "Compte organisateur validé");
});
