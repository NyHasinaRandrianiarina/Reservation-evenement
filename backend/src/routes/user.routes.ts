import { Router } from "express";
import {
  approveOrganizer,
  getOrganizer,
  listOrganizers,
  listPendingOrganizers,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async-handler.js";

const userRouter: Router = Router();

// Public organizers
userRouter.get("/organizers", listOrganizers);
userRouter.get("/organizers/:id", getOrganizer);

// Admin: validation des organisateurs
userRouter.get(
  "/admin/organizers/pending",
  asyncHandler(authenticate),
  authorize("ADMIN"),
  listPendingOrganizers
);
userRouter.patch(
  "/admin/organizers/:id/approve",
  asyncHandler(authenticate),
  authorize("ADMIN"),
  approveOrganizer
);

export default userRouter;
