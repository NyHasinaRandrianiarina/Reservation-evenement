import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { cancelMine, listMine } from "../controllers/registration.controller.js";

const registrationRouter: Router = Router();

registrationRouter.use(asyncHandler(authenticate), authorize("PARTICIPANT"));
registrationRouter.get("/me", listMine);
registrationRouter.patch("/:id/cancel", cancelMine);

export default registrationRouter;
