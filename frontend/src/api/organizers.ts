import { apiRequest } from "@/api/http";
import { toFrontendEvent } from "@/api/events";
import type { Event } from "@/types/event";

export interface OrganizerProfile {
  id: string;
  name: string;
  avatar: string;
  description: string;
  eventsCount: number;
  categories: string[];
}

export interface PendingOrganizer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  _count?: { events: number };
}

function toOrganizerProfile(u: BackendUser): OrganizerProfile {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
    description: u.bio || "",
    eventsCount: u._count?.events || 0,
    categories: [],
  };
}

/**
 * Récupérer la liste de tous les organisateurs
 */
export async function getOrganizers(): Promise<OrganizerProfile[]> {
  const res = await apiRequest<BackendUser[], null>({
    method: "GET",
    path: "/users/organizers",
  });

  return (res.data || []).map(toOrganizerProfile);
}

/**
 * Récupérer le profil d'un organisateur par son ID
 */
export async function getOrganizerById(id: string): Promise<OrganizerProfile> {
  const res = await apiRequest<BackendUser, null>({
    method: "GET",
    path: `/users/organizers/${id}`,
  });

  return toOrganizerProfile(res.data);
}

/**
 * Récupérer les événements d'un organisateur (à venir et passés)
 */
export async function getOrganizerPublicEvents(organizerId: string): Promise<{
  upcoming: Event[];
  past: Event[];
}> {
  const res = await apiRequest<any[], null>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method: "GET",
    path: `/events?organizer_id=${organizerId}&limit=100`,
  });

  const now = new Date();
  const all = (res.data || []).map(toFrontendEvent);

  return {
    upcoming: all.filter((e) => new Date(e.startDate) >= now),
    past: all.filter((e) => new Date(e.startDate) < now),
  };
}

export async function getPendingOrganizers(): Promise<PendingOrganizer[]> {
  const res = await apiRequest<PendingOrganizer[], null>({
    method: "GET",
    path: "/users/admin/organizers/pending",
  });

  return res.data || [];
}

export async function approveOrganizer(organizerId: string): Promise<void> {
  await apiRequest<null, null>({
    method: "PATCH",
    path: `/users/admin/organizers/${organizerId}/approve`,
  });
}
