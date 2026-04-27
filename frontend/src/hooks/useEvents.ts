import { useQuery } from '@tanstack/react-query';
import { getPublicEvents, getPublicEventById } from '@/api/events';
import type { Event, EventFilters } from '@/types/event';
import { EVENTS_PER_PAGE } from '@/lib/constants';

function applyFilters(events: Event[], filters?: EventFilters): Event[] {
  let result = [...events];

  // Exclude past events by default (unless explicitly looking for them)
  result = result.filter((e) => e.status !== 'past');

  if (!filters) return result;

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Category
  if (filters.category && filters.category !== 'all') {
    result = result.filter((e) => e.category === filters.category);
  }

  // Date range
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    let end: Date;

    switch (filters.dateRange) {
      case 'weekend': {
        const dayOfWeek = now.getDay();
        const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 0;
        const friday = new Date(start);
        friday.setDate(friday.getDate() + daysUntilFriday);
        end = new Date(friday);
        end.setDate(end.getDate() + 2);
        end.setHours(23, 59, 59, 999);
        result = result.filter((e) => {
          const d = new Date(e.startDate);
          return d >= friday && d <= end;
        });
        break;
      }
      case 'week': {
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        result = result.filter((e) => {
          const d = new Date(e.startDate);
          return d >= start && d <= end;
        });
        break;
      }
      case 'month': {
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        result = result.filter((e) => {
          const d = new Date(e.startDate);
          return d >= start && d <= end;
        });
        break;
      }
    }
  }

  // Price
  if (filters.priceType && filters.priceType !== 'all') {
    result = result.filter((e) => {
      const minPrice = Math.min(...e.ticketTypes.filter((t) => t.visible).map((t) => t.price));
      return filters.priceType === 'free' ? minPrice === 0 : minPrice > 0;
    });
  }

  // Sort by date ascending (closest first)
  result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return result;
}

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async (): Promise<PaginatedEvents> => {
      // Fetch all events from API
      const events = await getPublicEvents();

      // Apply filters client-side for now (cast to Event type for compatibility)
      const filtered = applyFilters(events as unknown as Event[], filters);
      const page = filters?.page ?? 1;
      const start = (page - 1) * EVENTS_PER_PAGE;
      const paged = filtered.slice(start, start + EVENTS_PER_PAGE);

      return {
        events: paged,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / EVENTS_PER_PAGE),
      };
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getPublicEventById(id),
    enabled: !!id,
  });
}
