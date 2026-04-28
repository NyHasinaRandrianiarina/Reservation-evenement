// ─── Event domain types ───

export type EventCategory =
  | 'conference'
  | 'concert'
  | 'formation'
  | 'corporate'
  | 'sport';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'sold_out'
  | 'cancelled'
  | 'past';

export type PriceFilter = 'all' | 'free' | 'paid';

export type DateFilter = 'all' | 'weekend' | 'week' | 'month';

export interface OrganizerSummary {
  id: string;
  name: string;
  avatar: string;
  description?: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
  description: string;
  salesStart: string;
  salesEnd: string;
  minPerOrder: number;
  maxPerOrder: number;
  visible: boolean;
}

export interface EventLocation {
  type: 'in_person' | 'online' | 'hybrid';
  venue?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  onlineUrl?: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: EventLocation;
  capacity: number | null;
  totalSold: number;
  organizer: OrganizerSummary;
  ticketTypes: TicketType[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Derived helpers
export function getMinPrice(event: Event): number | null {
  const ticketTypes = Array.isArray((event as any).ticketTypes)
    ? (event as any).ticketTypes
    : [];
  const visibleTickets = ticketTypes.filter((t: any) => t && t.visible);
  if (visibleTickets.length === 0) return null;
  return Math.min(...visibleTickets.map((t: any) => t.price));
}

export function getRemainingCapacity(event: Event): number | null {
  if (event.capacity === null) return null;
  return event.capacity - event.totalSold;
}

export function isAlmostFull(event: Event): boolean {
  const remaining = getRemainingCapacity(event);
  return remaining !== null && remaining > 0 && remaining <= 10;
}

export interface EventFilters {
  search?: string;
  category?: EventCategory | 'all';
  dateRange?: DateFilter;
  city?: string;
  priceType?: PriceFilter;
  page?: number;
}
