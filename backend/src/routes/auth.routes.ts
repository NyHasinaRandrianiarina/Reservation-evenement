import { Router } from "express";
import {
  register,
  login,
  verifyLogin2fa,
  logout,
  refresh,
  me,
  enable2fa,
  confirm2fa,
  disable2fa,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  registerValidation,
  loginValidation,
  verify2faValidation,
  confirm2faValidation,
} from "../validations/auth.validation.js";

const authRoute: Router = Router();

// ── Routes publiques ──
authRoute.post("/register", validate(registerValidation), register);
authRoute.post("/login", validate(loginValidation), login);
authRoute.post("/login/verify-2fa", validate(verify2faValidation), verifyLogin2fa);
authRoute.post("/refresh", refresh);

// ── Routes protégées ──
authRoute.post("/logout", asyncHandler(authenticate), logout);
authRoute.get("/me", asyncHandler(authenticate), me);
authRoute.post("/2fa/enable", asyncHandler(authenticate), enable2fa);
authRoute.post("/2fa/confirm", asyncHandler(authenticate), validate(confirm2faValidation), confirm2fa);
authRoute.post("/2fa/disable", asyncHandler(authenticate), disable2fa);

export default authRoute;