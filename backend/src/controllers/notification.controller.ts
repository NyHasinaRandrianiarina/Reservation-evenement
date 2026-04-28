import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  listNotificationsForUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service.js";

export const listMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const items = await listNotificationsForUser(user.id);
  ApiResponse.success(res, items, "Notifications récupérées");
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const id = String(req.params.id);
  const updated = await markNotificationAsRead(user.id, id);
  ApiResponse.success(res, updated, "Notification marquée comme lue");
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  await markAllNotificationsAsRead(user.id);
  ApiResponse.success(res, null, "Toutes les notifications ont été marquées comme lues");
});
