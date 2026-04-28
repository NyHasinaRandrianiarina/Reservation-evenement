import bcrypt from "bcryptjs";
import prisma from "../db/client.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../secrets.js";

export async function seedAdmin(options?: { resetPassword?: boolean }) {
  const adminEmail = ADMIN_EMAIL?.trim();
  const adminPassword = ADMIN_PASSWORD?.trim();

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL manquant dans les variables d'environnement");
  }

  const shouldResetPassword = Boolean(options?.resetPassword);

  if (shouldResetPassword && !adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD manquant: requis quand --reset-password est utilisé"
    );
  }

  const passwordHash =
    shouldResetPassword && adminPassword
      ? await bcrypt.hash(adminPassword, 12)
      : undefined;

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      full_name: "Admin",
      email: adminEmail,
      password: passwordHash ?? (await bcrypt.hash(adminPassword ?? "", 12)),
      role: "ADMIN" as never,
      is_active: true,
      onboarding_completed: true,
    } as any,
    update: {
      role: "ADMIN" as never,
      is_active: true,
      onboarding_completed: true,
      ...(passwordHash ? { password: passwordHash } : null),
    } as any,
  });
}
