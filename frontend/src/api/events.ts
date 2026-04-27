import type { EventDraft } from "@/store/useEventWizardStore";

// Replace these with actual API types when backend is ready
export type EventResponse = {
  id: string;
  title: string;
  status: "draft" | "published";
  created_at: string;
};

export async function createEvent(data: EventDraft): Promise<EventResponse> {
  // MOCK IMPLEMENTATION
  // To use the real API later, simply remove the mock code below and uncomment:
  // return apiRequest<EventResponse>({ method: "POST", path: "/events", body: data });
  
  console.log("Mocking event creation with data:", data);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "evt_" + Math.random().toString(36).substring(7),
        title: data.title || "Nouvel événement",
        status: "published",
        created_at: new Date().toISOString(),
      });
    }, 1500); // Simulate network delay
  });
}
