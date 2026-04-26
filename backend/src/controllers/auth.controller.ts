import type { Request, Response } from "express";
import prisma from "../db/client.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { BadRequestError, UnauthorizedError } from "../errors/app-error.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTwoFaToken,
  verifyRefreshToken,
  verifyTwoFaToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  setAuthCookies,
  clearAuthCookies,
} from "../services/token.service.js";
import { generateOtp, verifyOtp } from "../services/otp.service.js";
import { sendOtpEmail } from "../services/email.service.js";

/**
 * Inscription d'un nouvel utilisateur.
 * Crée le compte et connecte directement (émet les cookies).
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, phone, address, zone, is_seller } =
    req.body;

  const user = await registerUser({
    first_name,
    last_name,
    email,
    password,
    phone,
    address,
    zone,
    is_delivery: Boolean(is_seller),
  });

  // Connexion immédiate après inscription
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id, req);

  setAuthCookies(res, accessToken, refreshToken);

  ApiResponse.created(res, user, "Compte créé avec succès");
});

/**
 * Connexion utilisateur.
 * - Si 2FA désactivé → émet les cookies directement.
 * - Si 2FA activé → envoie un OTP par email et retourne un temp_token.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  // Si 2FA activé → envoyer OTP et retourner un token temporaire
  if (user.two_fa_enabled) {
    const otpCode = await generateOtp(user.id, "TWO_FA");
    await sendOtpEmail(user.email, otpCode, user.first_name);

    const tempToken = generateTwoFaToken(user.id);

    ApiResponse.success(
      res,
      { requires_2fa: true, temp_token: tempToken },
      "Code de vérification envoyé par email"
    );
    return;
  }

  // Connexion directe (2FA désactivé)
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id, req);

  setAuthCookies(res, accessToken, refreshToken);

  const { password: _, ...userWithoutPassword } = user;

  ApiResponse.success(res, userWithoutPassword, "Connexion réussie");
});

/**
 * Vérifie le code OTP 2FA lors du login.
 * Requiert un temp_token (émis lors du login) + le code OTP.
 */
export const verifyLogin2fa = asyncHandler(
  async (req: Request, res: Response) => {
    const { temp_token, code } = req.body;

    if (!temp_token || !code) {
      throw new BadRequestError("Token temporaire et code OTP requis");
    }

    // Vérifier le token temporaire
    let payload;
    try {
      payload = verifyTwoFaToken(temp_token);
    } catch {
      throw new UnauthorizedError(
        "Token temporaire invalide ou expiré. Veuillez vous reconnecter."
      );
    }

    // Vérifier le code OTP
    await verifyOtp(payload.userId, code, "TWO_FA");

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        address: true,
        zone: true,
        avatar_url: true,
        onboarding_completed: true,
        role: true,
        two_fa_enabled: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Utilisateur introuvable");
    }

    // Émettre les cookies
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, req);

    setAuthCookies(res, accessToken, refreshToken);

    ApiResponse.success(res, user, "Connexion réussie");
  }
);

/**
 * Déconnexion — révoque le refresh token et supprime les cookies.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refresh_token as string | undefined;

  if (refreshTokenValue) {
    await revokeRefreshToken(refreshTokenValue);
  }

  clearAuthCookies(res);

  ApiResponse.success(res, null, "Déconnexion réussie");
});

/**
 * Renouvelle l'access token à partir du refresh token.
 * Rotation du refresh token : l'ancien est révoqué, un nouveau est émis.
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refresh_token as string | undefined;

  if (!refreshTokenValue) {
    throw new UnauthorizedError("Refresh token manquant");
  }

  let decoded;
  try {
    decoded = await verifyRefreshToken(refreshTokenValue);
  } catch {
    clearAuthCookies(res);
    throw new UnauthorizedError("Refresh token invalide ou expiré");
  }

  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    clearAuthCookies(res);
    throw new UnauthorizedError("Utilisateur introuvable");
  }

  // Rotation : révoquer l'ancien, émettre un nouveau
  await revokeRefreshToken(refreshTokenValue);

  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = await generateRefreshToken(user.id, req);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  ApiResponse.success(res, null, "Token renouvelé avec succès");
});

/**
 * Retourne le profil de l'utilisateur connecté.
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.success(res, req.user, "Profil récupéré avec succès");
});

/**
 * Demande l'activation du 2FA — envoie un code OTP par email.
 */
export const enable2fa = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  if (user.two_fa_enabled) {
    throw new BadRequestError("Le 2FA est déjà activé sur votre compte");
  }

  const otpCode = await generateOtp(user.id, "TWO_FA");
  await sendOtpEmail(user.email, otpCode, user.first_name);

  ApiResponse.success(
    res,
    null,
    "Code de vérification envoyé par email. Confirmez avec /auth/2fa/confirm"
  );
});

/**
 * Confirme l'activation du 2FA avec le code OTP reçu par email.
 */
export const confirm2fa = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { code } = req.body;

  if (user.two_fa_enabled) {
    throw new BadRequestError("Le 2FA est déjà activé sur votre compte");
  }

  await verifyOtp(user.id, code, "TWO_FA");

  // Activer le 2FA
  await prisma.user.update({
    where: { id: user.id },
    data: { two_fa_enabled: true },
  });

  ApiResponse.success(res, null, "Authentification à deux facteurs activée");
});

/**
 * Désactive le 2FA (interdit pour les admins).
 */
export const disable2fa = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  if (!user.two_fa_enabled) {
    throw new BadRequestError("Le 2FA n'est pas activé sur votre compte");
  }

  if (user.role === "ADMIN") {
    throw new BadRequestError(
      "Les administrateurs ne peuvent pas désactiver le 2FA"
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { two_fa_enabled: false },
  });

  // Révoquer tous les tokens pour forcer une reconnexion
  await revokeAllUserTokens(user.id);

  ApiResponse.success(
    res,
    null,
    "Authentification à deux facteurs désactivée"
  );
});
