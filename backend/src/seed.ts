import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import prisma from "./db/client.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./secrets.js";

// Charger .env (utile en local)
dotenv.config();

/**
 * Crée un compte admin s’il n’existe pas déjà.
 * Idempotent : peut être lancé plusieurs fois sans créer de doublon.
 * Lit les identifiants depuis les variables d’environnement :
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 */
async function seedAdmin() {
  const adminEmail = ADMIN_EMAIL?.trim();
  const adminPassword = ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌ Erreur : variables ADMIN_EMAIL et ADMIN_PASSWORD obligatoires dans .env"
    );
    process.exit(1);
  }

  console.log(`🔍 Vérification de l’admin ${adminEmail}...`);

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("✅ Admin déjà présent, aucune action.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      first_name: "Admin",
      last_name: "TrackIt",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      is_active: true,
      onboarding_completed: true,
    },
  });

  console.log(`✅ Admin créé : ${admin.email} (id: ${admin.id})`);
}

/**
 * Lance le seed et ferme proprement la connexion Prisma.
 */
async function main() {
  try {
    await seedAdmin();
  } catch (err) {
    console.error("❌ Erreur durant le seed :", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
