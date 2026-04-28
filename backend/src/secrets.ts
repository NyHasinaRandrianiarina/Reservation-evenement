import dotenv from "dotenv";

// Charger .env uniquement en développement local
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: ".env",
  });
}

// Serveur
export const PORT = process.env.SERVER_PORT || process.env.PORT || "8000";
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const NODE_ENV = process.env.NODE_ENV || "development";

// JWT
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
export const ACCESS_TOKEN_EXPIRES_IN = "1000d"; // 1000 jours pour test/dev
export const REFRESH_TOKEN_EXPIRES_IN_MS = 1000 * 24 * 60 * 60 * 1000; // 1000 jours

// SMTP 
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM || "noreply@handyhub.mg";

// Compte admin pour le seed
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;