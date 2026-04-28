import { Router } from "express";
import authRouter from "./auth.routes.js";
import eventRouter from "./event.routes.js";

const router: Router = Router()

router.use("/auth", authRouter)
router.use("/events", eventRouter)

export default router