import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  listMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";

const notificationRouter: Router = Router();

notificationRouter.use(asyncHandler(authenticate));
notificationRouter.get("/", listMyNotifications);
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.patch("/read-all", markAllAsRead);

export default notificationRouter;
