import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  NODE_ENV,
} from "../secrets.js";

// ──────────────────────────────────────────────
// Transporteur Nodemailer
// ──────────────────────────────────────────────

/**
 * Crée le transporteur SMTP.
 * Si les variables SMTP ne sont pas configurées, on log en console (dev fallback).
 */
function createTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

// ──────────────────────────────────────────────
// Envoi d'email OTP
// ──────────────────────────────────────────────

/**
 * Envoie un email contenant le code OTP.
 * En dev, si le SMTP n'est pas configuré, le code est loggé dans la console.
 */
export async function sendOtpEmail(
  to: string,
  code: string,
  userName: string
): Promise<void> {
  const subject = "HandyHub — Votre code de vérification";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
      <div style="max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">HandyHub</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Bonjour <strong>${userName}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Voici votre code de vérification :</p>
          <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">⏱ Ce code expire dans <strong>10 minutes</strong>.</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} HandyHub. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Fallback console en développement si SMTP non configuré
  if (!transporter) {
    console.log("────────────────────────────────────────");
    console.log(`📧 EMAIL OTP (dev fallback)`);
    console.log(`   To:   ${to}`);
    console.log(`   Code: ${code}`);
    console.log("────────────────────────────────────────");
    return;
  }

  await transporter.sendMail({
    from: `"HandyHub" <${SMTP_FROM}>`,
    to,
    subject,
    html,
  });

  if (NODE_ENV === "development") {
    console.log(`📧 Email OTP envoyé à ${to}`);
  }
}
