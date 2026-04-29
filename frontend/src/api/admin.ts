import { apiRequest } from "@/api/http";

// --- Types ---

export type AdminEventStatus = "draft" | "published" | "cancelled";

export interface AdminEvent {
  id: string;
  title: string;
  category: string;
  status: AdminEventStatus;
  start_date: string;
  end_date: string;
  is_private: boolean;
  cover_image_url: string | null;
  created_at: string;
  organizer: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  _count: {
    registrations: number;
  };
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: "PARTICIPANT" | "ORGANIZER" | "ADMIN";
  is_active: boolean;
  organizer_approved: boolean;
  avatar_url: string | null;
  created_at: string;
  _count: {
    events: number;
    registrations: number;
  };
}

export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  pendingOrganizers: number;
  eventsByStatus: Record<string, number>;
  eventsByCategory: { category: string; count: number }[];
  registrationsByMonth: { month: string; count: number }[];
  topOrganizers: {
    id: string;
    name: string;
    avatar_url: string | null;
    eventsCount: number;
    registrationsCount: number;
  }[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- API Functions ---

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiRequest<AdminStats>({
    method: "GET",
    path: "/admin/stats",
  });
  return res.data;
}

export async function getAdminEvents(params?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ events: AdminEvent[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.category) query.append("category", params.category);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const qs = query.toString();
  const res = await apiRequest<{ events: AdminEvent[]; total: number; totalPages: number }>({
    method: "GET",
    path: `/admin/events${qs ? `?${qs}` : ""}`,
  });
  return res.data;
}

export async function adminUpdateEventStatus(
  eventId: string,
  status: AdminEventStatus
): Promise<AdminEvent> {
  const res = await apiRequest<AdminEvent, { status: AdminEventStatus }>({
    method: "PATCH",
    path: `/admin/events/${eventId}/status`,
    body: { status },
  });
  return res.data;
}

export async function adminDeleteEvent(eventId: string): Promise<void> {
  await apiRequest<void>({
    method: "DELETE",
    path: `/admin/events/${eventId}`,
  });
}

export async function getAdminUsers(params?: {
  role?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.role) query.append("role", params.role);
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const qs = query.toString();
  const res = await apiRequest<{ users: AdminUser[]; total: number; totalPages: number }>({
    method: "GET",
    path: `/admin/users${qs ? `?${qs}` : ""}`,
  });
  return res.data;
}

export async function adminUpdateUserStatus(
  userId: string,
  isActive: boolean
): Promise<AdminUser> {
  const res = await apiRequest<AdminUser, { is_active: boolean }>({
    method: "PATCH",
    path: `/admin/users/${userId}/status`,
    body: { is_active: isActive },
  });
  return res.data;
}
