import { Router } from "express";
import authRouter from "./auth.routes.js";
import eventRouter from "./event.routes.js";
import notificationRouter from "./notification.routes.js";
import registrationRouter from "./registration.routes.js";
import userRouter from "./user.routes.js";

const router: Router = Router()

router.use("/auth", authRouter)
router.use("/events", eventRouter)
router.use("/notifications", notificationRouter)
router.use("/registrations", registrationRouter)
router.use("/users", userRouter)

export default router