export type Role = "PARTICIPANT" | "ORGANIZER" | "ADMIN";

/**
 * Payload décodé du JWT access token.
 */
export interface JwtPayload {
  userId: string;
  role: Role;
}

/**
 * Payload décodé du token temporaire 2FA.
 */
export interface TwoFaPayload {
  userId: string;
  purpose: "2fa_verification";
}

/**
 * Données utilisateur attachées à req.user par le middleware authenticate.
 */
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  zone?: string | null;
  onboarding_completed: boolean;
  two_fa_enabled: boolean;
  is_active: boolean;
}

// ── Augmentation du type Express Request ──

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
