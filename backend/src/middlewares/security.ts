import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";
import { FRONTEND_URL } from "../secrets.js";

// ──────────────────────────────────────────────
// Helmet — Headers HTTP de sécurité
// ──────────────────────────────────────────────

const helmetMiddleware = helmet();

// ──────────────────────────────────────────────
// CORS — Cross-Origin Resource Sharing
// ──────────────────────────────────────────────

const corsMiddleware = cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// ──────────────────────────────────────────────
// Rate Limiter — Global (DÉSACTIVÉ)
// ──────────────────────────────────────────────

// const globalRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 100,
//   standardHeaders: "draft-7", // RateLimit-* headers
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Trop de requêtes, veuillez réessayer dans quelques minutes",
//   },
// });

const globalRateLimiter = null; // Désactivé

// ──────────────────────────────────────────────
// Rate Limiter — Auth (DÉSACTIVÉ)
// Plus strict pour éviter le brute-force
// ──────────────────────────────────────────────

// export const authRateLimiter: RequestHandler = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 10,
//   standardHeaders: "draft-7",
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message:
//       "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes",
//   },
// });

// export const authRateLimiter: RequestHandler = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 10,
//   standardHeaders: "draft-7",
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message:
//       "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes",
//   },
// });

// Rate limiter désactivé - retourne un middleware no-op
export const authRateLimiter: RequestHandler = (req, res, next) => next();

// ──────────────────────────────────────────────
// Export — Tableau de middlewares de sécurité
// ──────────────────────────────────────────────

export const securityMiddleware: RequestHandler[] = [
  helmetMiddleware,
  corsMiddleware,
  // globalRateLimiter, // Désactivé
];
