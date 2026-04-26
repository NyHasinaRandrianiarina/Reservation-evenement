import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../db/client.js";
import { BadRequestError } from "../errors/app-error.js";
import type { OtpType } from "@prisma/client";

const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

// ──────────────────────────────────────────────
// Génération OTP
// ──────────────────────────────────────────────

/**
 * Génère un code OTP à 6 chiffres, le hash et le stocke en base.
 * Invalide automatiquement les anciens codes du même type pour cet utilisateur.
 *
 * @returns Le code OTP en clair (à envoyer par email).
 */
export async function generateOtp(
  userId: string,
  type: OtpType
): Promise<string> {
  // Invalider les anciens codes non utilisés du même type
  await prisma.otpCode.updateMany({
    where: {
      user_id: userId,
      type,
      used_at: null,
    },
    data: { used_at: new Date() },
  });

  // Générer un code à 6 chiffres cryptographiquement sûr
  const code = crypto.randomInt(100_000, 999_999).toString();

  // Hasher le code avant stockage
  const hashedCode = await bcrypt.hash(code, 10);

  await prisma.otpCode.create({
    data: {
      code: hashedCode,
      user_id: userId,
      type,
      expires_at: new Date(Date.now() + OTP_EXPIRATION_MS),
    },
  });

  return code;
}

// ──────────────────────────────────────────────
// Vérification OTP
// ──────────────────────────────────────────────

/**
 * Vérifie un code OTP : le compare aux codes en base, vérifie l'expiration,
 * et marque le code comme utilisé.
 *
 * @throws BadRequestError si le code est invalide ou expiré.
 */
export async function verifyOtp(
  userId: string,
  code: string,
  type: OtpType
): Promise<void> {
  // Récupérer les codes non utilisés et non expirés pour cet utilisateur
  const otpCodes = await prisma.otpCode.findMany({
    where: {
      user_id: userId,
      type,
      used_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
    take: 5, // Limiter la recherche aux 5 derniers codes
  });

  if (otpCodes.length === 0) {
    throw new BadRequestError("Code OTP expiré ou invalide");
  }

  // Vérifier le code contre chaque hash (normalement un seul actif)
  let matchedOtp: (typeof otpCodes)[0] | null = null;

  for (const otp of otpCodes) {
    const isValid = await bcrypt.compare(code, otp.code);
    if (isValid) {
      matchedOtp = otp;
      break;
    }
  }

  if (!matchedOtp) {
    throw new BadRequestError("Code OTP invalide");
  }

  // Marquer comme utilisé
  await prisma.otpCode.update({
    where: { id: matchedOtp.id },
    data: { used_at: new Date() },
  });
}
