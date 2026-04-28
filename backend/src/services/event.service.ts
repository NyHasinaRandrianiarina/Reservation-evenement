import prisma from "../db/client.js";

function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
    venue?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    onlineUrl?: string;
  };
  capacity: number | null;
  isPrivate: boolean;
  coverImageUrl?: string;
  tickets: TicketType[];
  customFields: CustomField[];
}

interface CreateEventInput {
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date: string;
  location: {
    type: "in_person" | "online" | "hybrid";
    venue?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    onlineUrl?: string;
  };
  capacity: number | null;
  is_private: boolean;
  cover_image_url?: string;
  tickets: TicketType[];
  custom_fields: CustomField[];
}

/**
 * Crée un événement pour un organisateur authentifié.
 * Persiste les champs simples + les JSON (location, tickets, custom_fields).
 */
export async function createEvent(organizerId: string, data: EventDraft) {
  const payload = data as unknown as Partial<CreateEventInput> & Partial<EventDraft>;
  const startDate = payload.start_date ?? payload.startDate;
  const endDate = payload.end_date ?? payload.endDate;

  const isPrivate = payload.is_private ?? payload.isPrivate ?? false;
  const coverImageUrl = payload.cover_image_url ?? payload.coverImageUrl ?? undefined;
  const tickets = payload.tickets ?? [];
  const customFields = payload.custom_fields ?? payload.customFields ?? [];

  const event = await (prisma as any).event.create({
    data: {
      title: payload.title,
      category: payload.category,
      description: payload.description,
      start_date: new Date(String(startDate)),
      end_date: new Date(String(endDate)),
      location: payload.location,
      capacity: payload.capacity ?? null,
      is_private: isPrivate,
      cover_image_url: coverImageUrl,
      status: "published", // pour EventNest V1 : on publie directement
      organizer_id: organizerId,
      tickets,
      custom_fields: customFields,
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
 * Met à jour le statut d'un événement si l'utilisateur est bien l'organisateur.
 */
export async function updateEventStatus(eventId: string, organizerId: string, status: string) {
  const event = await getEventByIdAndOrganizer(eventId, organizerId);
  if (!event) return null;

  return (prisma as any).event.update({
    where: { id: eventId },
    data: { status },
  });
}

/**
 * Met à jour un événement si l'utilisateur est bien l'organisateur.
 * Accepte le payload snake_case (API) et tolère aussi camelCase (compat).
 */
export async function updateEvent(eventId: string, organizerId: string, data: unknown) {
  const existing = await getEventByIdAndOrganizer(eventId, organizerId);
  if (!existing) return null;

  const payload = data as unknown as Partial<CreateEventInput> & Partial<EventDraft>;
  const startDate = payload.start_date ?? payload.startDate;
  const endDate = payload.end_date ?? payload.endDate;

  const isPrivate = payload.is_private ?? payload.isPrivate;
  const coverImageUrl = payload.cover_image_url ?? payload.coverImageUrl;
  const tickets = payload.tickets;
  const customFields = payload.custom_fields ?? payload.customFields;

  return (prisma as any).event.update({
    where: { id: eventId },
    data: {
      title: payload.title,
      category: payload.category,
      description: payload.description,
      start_date: startDate ? new Date(String(startDate)) : undefined,
      end_date: endDate ? new Date(String(endDate)) : undefined,
      location: payload.location,
      capacity: payload.capacity ?? undefined,
      is_private: isPrivate ?? undefined,
      cover_image_url: coverImageUrl === undefined ? undefined : coverImageUrl,
      tickets: tickets ?? undefined,
      custom_fields: customFields ?? undefined,
    },
  });
}

/**
 * Supprime un événement si l'utilisateur est bien l'organisateur.
 */
export async function deleteEvent(eventId: string, organizerId: string) {
  const existing = await getEventByIdAndOrganizer(eventId, organizerId);
  if (!existing) return null;

  await (prisma as any).event.delete({
    where: { id: eventId },
  });

  return true;
}

/**
 * Retourne tous les événements publics (statut publié) pour le catalogue.
 */
export async function getPublicEvents(filters?: { organizer_id?: string; limit?: number }) {
  const where: Record<string, unknown> = { status: "published" };
  if (filters?.organizer_id) {
    where["organizer_id"] = filters.organizer_id;
  }

  return (prisma as any).event.findMany({
    where,
    orderBy: { start_date: "asc" },
    take: filters?.limit,
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

/**
 * Retourne un événement public par son ID ou par son slug (dérivé du titre).
 * Utile côté frontend : les URLs publiques utilisent souvent le slug.
 */
export async function getPublicEventByIdOrSlug(idOrSlug: string) {
  const byId = await getPublicEventById(idOrSlug);
  if (byId) return byId;

  const published = await (prisma as any).event.findMany({
    where: { status: "published" },
    orderBy: { created_at: "desc" },
  });

  return (
    published.find((e: any) => slugify(String(e.title ?? "")) === idOrSlug) ?? null
  );
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
