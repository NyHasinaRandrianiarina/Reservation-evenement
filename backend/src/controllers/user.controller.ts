import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { getOrganizerById, getOrganizers } from "../services/user.service.js";

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
