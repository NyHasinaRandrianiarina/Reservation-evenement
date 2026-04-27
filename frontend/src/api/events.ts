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
  const res = await apiRequest<Event[], null>({
    method: "GET",
    path: "/events/public",
  });

  return res.data;
}

/**
 * Récupère un événement public par son ID
 */
export async function getPublicEventById(id: string): Promise<Event> {
  const res = await apiRequest<Event, null>({
    method: "GET",
    path: `/events/public/${id}`,
  });

  return res.data;
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
  const res = await apiRequest<Event, null>({
    method: "GET",
    path: `/events/${id}`,
  });

  return res.data;
}

/**
 * Mettre à jour le statut d'un événement
 */
export async function updateEventStatus(id: string, status: "draft" | "published" | "cancelled"): Promise<Event> {
  const res = await apiRequest<Event, { status: string }>({
    method: "PATCH",
    path: `/events/${id}/status`,
    body: { status },
  });

  return res.data;
}
