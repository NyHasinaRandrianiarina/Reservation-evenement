import bcrypt from "bcryptjs";
import prisma from "../db/client.js";
import { faker } from "@faker-js/faker";

faker.seed(42); // Reproducible data

export async function seedOrganizers() {
  console.log("🌱 Création des organisateurs de test...");

  // Créer 5 organisateurs validés
  const organizerData = [
    {
      full_name: "Sophie Laurent",
      email: "sophie.laurent@eventnest.com",
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: true,
      is_active: true,
      onboarding_completed: true,
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=SL",
    },
    {
      full_name: "Marc Dubois",
      email: "marc.dubois@eventnest.com", 
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: true,
      is_active: true,
      onboarding_completed: true,
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=MD",
    },
    {
      full_name: "Léa Chen",
      email: "lea.chen@eventnest.com",
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: true,
      is_active: true,
      onboarding_completed: true,
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=LC",
    },
    {
      full_name: "Thomas Bernard",
      email: "thomas.bernard@eventnest.com",
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: true,
      is_active: true,
      onboarding_completed: true,
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=TB",
    },
    {
      full_name: "Camille Martin",
      email: "camille.martin@eventnest.com",
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: true,
      is_active: true,
      onboarding_completed: true,
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=CM",
    },
  ];

  for (const data of organizerData) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
  }

  // Créer 2 organisateurs en attente de validation
  const pendingData = [
    {
      full_name: "Alice Petit",
      email: "alice.petit@eventnest.com",
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: false, // En attente
      is_active: true,
      onboarding_completed: true,
    },
    {
      full_name: "David Rousseau",
      email: "david.rousseau@eventnest.com", 
      password: await bcrypt.hash("password123", 12),
      role: "ORGANIZER" as const,
      organizer_approved: false, // En attente
      is_active: true,
      onboarding_completed: true,
    },
  ];

  for (const data of pendingData) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
  }

  console.log("✅ Organisateurs créés :", organizerData.length, "validés +", pendingData.length, "en attente");
}
