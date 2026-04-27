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
export type { Event } from "@/types/event";

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
