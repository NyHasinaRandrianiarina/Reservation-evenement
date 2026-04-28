import { Router } from "express";
import { getOrganizer, listOrganizers } from "../controllers/user.controller.js";

const userRouter: Router = Router();

// Public organizers
userRouter.get("/organizers", listOrganizers);
userRouter.get("/organizers/:id", getOrganizer);

export default userRouter;
