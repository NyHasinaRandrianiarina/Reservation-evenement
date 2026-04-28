import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { createPublicRegistration } from "../services/registration.service.js";

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

  const result = await createPublicRegistration(eventIdOrSlug, payload);

  if (!result) {
    return ApiResponse.error(res, "Événement introuvable", 404);
  }

  if ("error" in result) {
    return ApiResponse.error(res, result.error, 400);
  }

  ApiResponse.created(res, result.registration, "Inscription confirmée");
});
