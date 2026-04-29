import { Router } from "express";
import {
  getStats,
  listAllEvents,
  updateEventStatus,
  deleteEvent,
  listAllUsers,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../middlewares/async-handler.js";

const adminRouter: Router = Router();

// All admin routes require authentication + ADMIN role
adminRouter.use(asyncHandler(authenticate), authorize("ADMIN"));

// Stats
adminRouter.get("/stats", getStats);

// Events management
adminRouter.get("/events", listAllEvents);
adminRouter.patch("/events/:id/status", updateEventStatus);
adminRouter.delete("/events/:id", deleteEvent);

// Users management
adminRouter.get("/users", listAllUsers);
adminRouter.patch("/users/:id/status", updateUserStatus);

export default adminRouter;
