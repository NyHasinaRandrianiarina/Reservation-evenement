import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { createDelivery, getAllDeliveries, getAvailableDrivers, assignDriver } from "../services/delivery.service.js";

/**
 * Créer une nouvelle demande de livraison
 * Rôle requis : SENDER
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { description, weight, pickup_address, delivery_address, recipient_name, recipient_phone } = req.body;
  const user = req.user!;

  const delivery = await createDelivery(user.id, {
    description,
    weight: weight ? parseFloat(weight) : null,
    pickup_address,
    delivery_address,
    recipient_name,
    recipient_phone
  });

  ApiResponse.created(res, delivery, "Demande de livraison créée avec succès");
});

/**
 * Lister toutes les livraisons (Admin)
 */
export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const deliveries = await getAllDeliveries(status ? { status } : undefined);
  ApiResponse.success(res, deliveries, "Liste des livraisons récupérée");
});

/**
 * Lister les livreurs disponibles (Admin)
 */
export const listDrivers = asyncHandler(async (_req: Request, res: Response) => {
  const drivers = await getAvailableDrivers();
  ApiResponse.success(res, drivers, "Liste des livreurs récupérée");
});

/**
 * Assigner un livreur à une livraison (Admin)
 */
export const assign = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { driver_id } = req.body;
  const admin = req.user!;

  const driverId = String(driver_id);

  const delivery = await assignDriver(id, driverId, admin.id);
  ApiResponse.success(res, delivery, "Livreur assigné avec succès");
});
