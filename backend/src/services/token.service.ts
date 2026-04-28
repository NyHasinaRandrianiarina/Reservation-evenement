import jwt from "jsonwebtoken";
import type { Response, Request } from "express";
import type { Role } from "@prisma/client";
import prisma from "../db/client.js";
import type { JwtPayload, TwoFaPayload } from "../types/express.js";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_EXPIRES_IN_MS,
  REFRESH_TOKEN_EXPIRES_IN_MS,
  NODE_ENV,
} from "../secrets.js";

// ──────────────────────────────────────────────
// Génération des tokens
// ──────────────────────────────────────────────

/**
 * Génère un access token JWT.
 */
export function generateAccessToken(userId: string, role: Role): string {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

/**
 * Génère un refresh token JWT (longue durée)
 * et le persiste en base pour pouvoir le révoquer.
 */
export async function generateRefreshToken(
  userId: string,
  req: Request
): Promise<string> {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

  const refreshTokenExpiresInSeconds = Math.floor(
    REFRESH_TOKEN_EXPIRES_IN_MS / 1000
  );

  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenExpiresInSeconds,
  });

  await prisma.refreshToken.create({
    data: {
      token,
      user_id: userId,
      user_agent: req.headers["user-agent"] ?? null,
      ip_address: req.ip ?? null,
      expires_at: expiresAt,
    },
  });

  return token;
}

/**
 * Génère un token temporaire pour la vérification 2FA (courte durée — 5 min).
 */
export function generateTwoFaToken(userId: string): string {
  const payload: TwoFaPayload = { userId, purpose: "2fa_verification" };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "5m" });
}

// ──────────────────────────────────────────────
// Vérification des tokens
// ──────────────────────────────────────────────

/**
 * Vérifie et décode un access token.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
}

/**
 * Vérifie un refresh token : JWT valide + existe en base + non révoqué + non expiré.
 */
export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string }> {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.revoked_at !== null) {
    throw new Error("Refresh token révoqué ou introuvable");
  }

  if (storedToken.expires_at < new Date()) {
    throw new Error("Refresh token expiré");
  }

  return decoded;
}

/**
 * Vérifie et décode un token temporaire 2FA.
 */
export function verifyTwoFaToken(token: string): TwoFaPayload {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as TwoFaPayload;

  if (decoded.purpose !== "2fa_verification") {
    throw new Error("Token invalide pour la vérification 2FA");
  }

  return decoded;
}

// ──────────────────────────────────────────────
// Révocation
// ──────────────────────────────────────────────

/**
 * Révoque un refresh token spécifique.
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

/**
 * Révoque tous les refresh tokens d'un utilisateur (ex: changement de mot de passe).
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

// ──────────────────────────────────────────────
// Cookies
// ──────────────────────────────────────────────

const IS_PROD = NODE_ENV === "production";

const COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  // Cross-origin (Vercel frontend ↔ Railway backend) : sameSite "none" obligatoire en prod
  sameSite: (IS_PROD ? "none" : "strict") as "none" | "strict",
  path: "/",
};

/**
 * Positionne les cookies httpOnly pour l'access token et le refresh token.
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
  });

  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
  });
}

/**
 * Supprime les cookies d'authentification.
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie("access_token", COOKIE_OPTIONS_BASE);
  res.clearCookie("refresh_token", COOKIE_OPTIONS_BASE);
}
