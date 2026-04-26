import bcrypt from "bcryptjs";
import prisma from "../db/client.js";
import { ConflictError, UnauthorizedError } from "../errors/app-error.js";
import type { AuthUser } from "../types/express.js";

/**
 * Champs sélectionnés pour renvoyer un utilisateur sans données sensibles.
 */
const USER_SELECT = {
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
} as const;

/**
 * Données nécessaires à l'inscription.
 */
interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  zone?: string;
  is_delivery?: boolean;
}

/**
 * Crée un nouvel utilisateur après vérification de l'unicité de l'email.
 * Hash le mot de passe et retourne le user sans données sensibles.
 */
export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Cet email est déjà utilisé");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone ?? null,
      address: data.address ?? null,
      zone: data.zone ?? null,
      role: data.is_delivery ? "DELIVERY" : "SENDER",
    },
    select: USER_SELECT,
  });

  return user;
}

/**
 * Vérifie les identifiants et retourne le user.
 * Lance UnauthorizedError si email/password incorrect.
 */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  return user;
}

/**
 * Récupère un utilisateur par son ID (sans données sensibles).
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });

  return user;
}
