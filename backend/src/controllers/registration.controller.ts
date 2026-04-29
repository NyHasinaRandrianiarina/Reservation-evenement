import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  cancelRegistration,
  createPublicRegistration,
  getParticipantRegistrations,
} from "../services/registration.service.js";
import { getUserById } from "../services/auth.service.js";
import { verifyAccessToken } from "../services/token.service.js";

export const createPublic = asyncHandler(async (req: Request, res: Response) => {
  const eventIdOrSlug = String(req.params.id);

  const payloadBase = {
    contact_first_name: String(req.body?.contact_first_name ?? ""),
    contact_last_name: String(req.body?.contact_last_name ?? ""),
    contact_email: String(req.body?.contact_email ?? ""),
    tickets: (req.body?.tickets ?? {}) as Record<string, number>,
  };

  const payload = req.body?.contact_phone
    ? { ...payloadBase, contact_phone: String(req.body.contact_phone) }
    : payloadBase;

  if (!payload.contact_first_name || !payload.contact_last_name || !payload.contact_email) {
    return ApiResponse.error(res, "Champs requis manquants", 400);
  }

  let participantId: string | undefined;
  const token = req.cookies?.access_token as string | undefined;
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await getUserById(decoded.userId);
      if (user) {
        participantId = user.id;
      }
    } catch {
      // Ignore invalid token and continue as public registration
    }
  }

  const result = await createPublicRegistration(eventIdOrSlug, payload, participantId);

  if (!result) {
    return ApiResponse.error(res, "Événement introuvable", 404);
  }

  if ("error" in result) {
    return ApiResponse.error(res, result.error, 400);
  }

  ApiResponse.created(res, result.registration, "Inscription confirmée");
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const registrations = await getParticipantRegistrations(user.id);
  ApiResponse.success(res, registrations, "Inscriptions récupérées");
});

export const cancelMine = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const registrationId = String(req.params.id);
  const registration = await cancelRegistration(registrationId, user.id);
  ApiResponse.success(res, registration, "Inscription annulée");
});
