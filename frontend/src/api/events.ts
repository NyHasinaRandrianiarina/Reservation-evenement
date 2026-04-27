import type { EventDraft } from "@/store/useEventWizardStore";
import { apiRequest } from "@/api/http";

// Replace these with actual API types when backend is ready
export type EventResponse = {
  id: string;
  title: string;
  status: "draft" | "published";
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
