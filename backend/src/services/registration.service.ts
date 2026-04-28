import prisma from "../db/client.js";
import { getPublicEventByIdOrSlug } from "./event.service.js";

export type CreateRegistrationInput = {
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone?: string;
  tickets: Record<string, number>;
};

export async function createPublicRegistration(eventIdOrSlug: string, payload: CreateRegistrationInput) {
  const event = await getPublicEventByIdOrSlug(eventIdOrSlug);
  if (!event) return null;

  const tickets = payload.tickets ?? {};
  const totalQuantity = Object.values(tickets).reduce((sum, q) => sum + Number(q || 0), 0);

  if (!Number.isFinite(totalQuantity) || totalQuantity <= 0) {
    return { error: "Quantité de billets invalide" as const };
  }

  if (event.capacity !== null && event.capacity !== undefined) {
    const existingAgg = await (prisma as any).registration.aggregate({
      where: { event_id: event.id, status: "confirmed" },
      _sum: { total_quantity: true },
    });

    const already = Number(existingAgg?._sum?.total_quantity ?? 0);
    const remaining = Number(event.capacity) - already;

    if (totalQuantity > remaining) {
      return { error: "Capacité insuffisante" as const };
    }
  }

  const created = await (prisma as any).registration.create({
    data: {
      event_id: event.id,
      participant_id: null,
      contact_first_name: payload.contact_first_name,
      contact_last_name: payload.contact_last_name,
      contact_email: payload.contact_email,
      contact_phone: payload.contact_phone ?? null,
      tickets,
      total_quantity: totalQuantity,
      status: "confirmed",
    },
  });

  return { registration: created };
}
