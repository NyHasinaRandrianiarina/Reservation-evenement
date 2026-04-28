import { apiRequest } from "@/api/http";

export type AppNotification = {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export async function getMyNotifications() {
  return apiRequest<AppNotification[]>({
    method: "GET",
    path: "/notifications",
  });
}

export async function markNotificationRead(id: string) {
  return apiRequest<AppNotification>({
    method: "PATCH",
    path: `/notifications/${id}/read`,
  });
}

export async function markAllNotificationsRead() {
  return apiRequest<null>({
    method: "PATCH",
    path: "/notifications/read-all",
  });
}
