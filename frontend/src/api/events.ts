import type { EventDraft } from "@/store/useEventWizardStore";
import { apiRequest } from "@/api/http";

// Replace these with actual API types when backend is ready
export type EventResponse = {
  id: string;
  title: string;
  status: "draft" | "published";
  created_at: string;
};

// Re-export frontend Event type for compatibility
import type { Event } from "@/types/event";
export type { Event };

type BackendEvent = {
  id: string;
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date: string;
  location: any;
  capacity: number | null;
  is_private: boolean;
  cover_image_url: string | null;
  status: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  tickets: any[];
  custom_fields: any[];
};

function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toFrontendEvent(e: BackendEvent): Event {
  const coverImage = e.cover_image_url ?? "";

  const ticketTypes = (Array.isArray(e.tickets) ? e.tickets : []).map((t: any) => {
    const price = t?.type === "paid" ? Number(t?.price ?? 0) : 0;
    const quota = t?.quota === null || t?.quota === undefined ? 0 : Number(t?.quota ?? 0);

    return {
      id: String(t?.id ?? crypto.randomUUID()),
      eventId: e.id,
      name: String(t?.name ?? "Billet"),
      price,
      quota,
      sold: 0,
      description: String(t?.description ?? ""),
      salesStart: e.created_at,
      salesEnd: e.end_date,
      minPerOrder: 1,
      maxPerOrder: Number(t?.limitPerOrder ?? 10),
      visible: true,
    };
  });

  return {
    id: e.id,
    slug: slugify(e.title) || e.id,
    title: e.title,
    description: e.description,
    coverImage,
    category: e.category as any,
    status: e.status as any,
    startDate: e.start_date,
    endDate: e.end_date,
    location: e.location ?? { type: "in_person" },
    capacity: e.capacity,
    totalSold: 0,
    organizer: {
      id: e.organizer_id,
      name: "",
      avatar: "",
    },
    ticketTypes,
    tags: [],
    isPublic: !e.is_private,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

export type OrganizerDashboardKpis = {
  registrationsToday: number;
  revenueMonth: number;
  remainingTickets: number | null;
  activeEvents: number;
  draftEvents: number;
};

export type OrganizerEventRow = {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  capacity: number | null;
  created_at: string;
};

type UploadCoverResponse = {
  url: string;
};

export async function createEvent(data: EventDraft): Promise<EventResponse> {
  const payload = {
    title: data.title,
    category: data.category,
    description: data.description,
    start_date: data.startDate,
    end_date: data.endDate,
    location: data.location,
    capacity: data.capacity,
    is_private: data.isPrivate,
    cover_image_url: data.coverImageUrl,
    tickets: data.tickets,
    custom_fields: data.customFields,
  };

  const res = await apiRequest<EventResponse, typeof payload>({
    method: "POST",
    path: "/events",
    body: payload,
  });

  return res.data;
}

/**
 * Récupère tous les événements publics (catalogue)
 */
export async function getPublicEvents(): Promise<Event[]> {
  const res = await apiRequest<BackendEvent[], null>({
    method: "GET",
    path: "/events/public",
  });

  return (res.data ?? []).map(toFrontendEvent);
}

/**
 * Récupère un événement public par son ID
 */
export async function getPublicEventById(id: string): Promise<Event> {
  const res = await apiRequest<BackendEvent, null>({
    method: "GET",
    path: `/events/public/${id}`,
  });

  return toFrontendEvent(res.data);
}

/**
 * KPIs dashboard organisateur
 */
export async function getOrganizerDashboardKpis(): Promise<OrganizerDashboardKpis> {
  const res = await apiRequest<OrganizerDashboardKpis, null>({
    method: "GET",
    path: "/events/dashboard/kpis",
  });

  return res.data;
}

/**
 * Liste des événements de l’organisateur connecté
 */
export async function getOrganizerEvents(): Promise<OrganizerEventRow[]> {
  const res = await apiRequest<OrganizerEventRow[], null>({
    method: "GET",
    path: "/events",
  });

  return res.data;
}
/**
 * Détail d'un événement pour l'organisateur connecté
 */
export async function getOrganizerEventById(id: string): Promise<Event> {
  const res = await apiRequest<BackendEvent, null>({
    method: "GET",
    path: `/events/${id}`,
  });

  return toFrontendEvent(res.data);
}

/**
 * Mettre à jour le statut d'un événement
 */
export async function updateEventStatus(id: string, status: "draft" | "published" | "cancelled"): Promise<Event> {
  const res = await apiRequest<BackendEvent, { status: string }>({
    method: "PATCH",
    path: `/events/${id}/status`,
    body: { status },
  });

  return toFrontendEvent(res.data);
}

/**
 * Upload d'image de couverture (multipart) — retourne une URL publique
 */
export async function uploadEventCover(file: File): Promise<UploadCoverResponse> {
  const API_URL = import.meta.env.VITE_API_URL || "";
  const API_BASE_URL = `${API_URL}/api/v1`;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/events/upload/cover`, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || "Erreur upload image");
  }

  return payload.data as UploadCoverResponse;
}
