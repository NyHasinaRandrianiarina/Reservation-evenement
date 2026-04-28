import { apiRequest } from "@/api/http";

type RegistrationEvent = {
  id: string;
  title: string;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  location: {
    type?: "in_person" | "online" | "hybrid";
    venue?: string;
    address?: string;
    city?: string;
    onlineUrl?: string;
  } | null;
  tickets?: Array<{ id?: string; name?: string }>;
  status: string;
};

export type ParticipantRegistration = {
  id: string;
  event_id: string;
  participant_id: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string | null;
  tickets: Record<string, number>;
  total_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  event: RegistrationEvent;
};

export async function getMyRegistrations() {
  return apiRequest<ParticipantRegistration[]>({
    method: "GET",
    path: "/registrations/me",
  });
}

export async function cancelMyRegistration(registrationId: string) {
  return apiRequest<ParticipantRegistration>({
    method: "PATCH",
    path: `/registrations/${registrationId}/cancel`,
  });
}
