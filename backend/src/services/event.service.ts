import prisma from "../db/client.js";

// Inline types to avoid cross-package imports
interface TicketType {
  id: string;
  name: string;
  type: "free" | "paid";
  price: number;
  quota: number | null;
  description: string;
  limitPerOrder: number;
}

interface CustomField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "checkbox";
  required: boolean;
  options?: string[];
}

interface EventDraft {
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    type: "in_person" | "online" | "hybrid";
    address?: string;
    onlineUrl?: string;
  };
  capacity: number | null;
  isPrivate: boolean;
  coverImageUrl?: string;
  tickets: TicketType[];
  customFields: CustomField[];
}

/**
 * Crée un événement pour un organisateur authentifié.
 * Persiste les champs simples + les JSON (location, tickets, custom_fields).
 */
export async function createEvent(organizerId: string, data: EventDraft) {
  const event = await (prisma as any).event.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      start_date: new Date(data.startDate),
      end_date: new Date(data.endDate),
      location: data.location,
      capacity: data.capacity,
      is_private: data.isPrivate,
      cover_image_url: data.coverImageUrl,
      status: "published", // pour EventNest V1 : on publie directement
      organizer_id: organizerId,
      tickets: data.tickets,
      custom_fields: data.customFields,
    },
  });

  return event;
}

/**
 * Retourne les événements créés par un organisateur.
 */
export async function getEventsByOrganizer(organizerId: string) {
  return (prisma as any).event.findMany({
    where: { organizer_id: organizerId },
    orderBy: { created_at: "desc" },
  });
}

/**
 * Retourne un événement par son ID, vérifie que l'utilisateur est bien l'organisateur.
 */
export async function getEventByIdAndOrganizer(eventId: string, organizerId: string) {
  return (prisma as any).event.findFirst({
    where: { id: eventId, organizer_id: organizerId },
  });
}

/**
 * Retourne tous les événements publics (statut publié) pour le catalogue.
 */
export async function getPublicEvents() {
  return (prisma as any).event.findMany({
    where: { status: "published" },
    orderBy: { start_date: "asc" },
  });
}

/**
 * Retourne un événement public par son ID (doit être publié).
 */
export async function getPublicEventById(eventId: string) {
  return (prisma as any).event.findFirst({
    where: { id: eventId, status: "published" },
  });
}

export interface OrganizerDashboardKpis {
  registrationsToday: number;
  revenueMonth: number;
  remainingTickets: number | null;
  activeEvents: number;
  draftEvents: number;
}

export async function getOrganizerDashboardKpis(organizerId: string): Promise<OrganizerDashboardKpis> {
  const events = await (prisma as any).event.findMany({
    where: { organizer_id: organizerId },
    select: {
      status: true,
      capacity: true,
    },
  });

  const activeEvents = events.filter((e: any) => e.status === "published").length;
  const draftEvents = events.filter((e: any) => e.status === "draft").length;

  // NOTE: V1 - Nous n'avons pas encore de table registrations/transactions,
  // donc on retourne 0 pour ces métriques.
  const registrationsToday = 0;
  const revenueMonth = 0;

  // Sans ventes, "remaining" = somme des capacities. Si au moins un événement illimité (capacity null), alors null.
  const hasUnlimited = events.some((e: any) => e.capacity === null);
  const remainingTickets = hasUnlimited
    ? null
    : events.reduce((sum: number, e: any) => sum + (e.capacity ?? 0), 0);

  return {
    registrationsToday,
    revenueMonth,
    remainingTickets,
    activeEvents,
    draftEvents,
  };
}
