import { Router } from "express";
import authRouter from "./auth.routes.js";
import deliveryRouter from "./delivery.routes.js";

const router: Router = Router()

router.use("/auth", authRouter)
router.use("/deliveries", deliveryRouter)

export default router