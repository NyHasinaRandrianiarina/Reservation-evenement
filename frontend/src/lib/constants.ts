import type { EventCategory, EventStatus, DateFilter, PriceFilter } from '@/types/event';

// ─── Category labels ───
export const CATEGORY_LABELS: Record<EventCategory | 'all', string> = {
  all: 'Toutes les catégories',
  conference: 'Conférence',
  concert: 'Concert',
  formation: 'Formation',
  corporate: 'Corporate',
  sport: 'Sport',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ─── Status labels ───
export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  sold_out: 'Complet',
  cancelled: 'Annulé',
  past: 'Terminé',
};

// ─── Date filter labels ───
export const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'Toutes les dates',
  weekend: 'Ce week-end',
  week: 'Cette semaine',
  month: 'Ce mois-ci',
};

export const DATE_FILTER_OPTIONS = Object.entries(DATE_FILTER_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ─── Price filter labels ───
export const PRICE_FILTER_LABELS: Record<PriceFilter, string> = {
  all: 'Tous les prix',
  free: 'Gratuit',
  paid: 'Payant',
};

export const PRICE_FILTER_OPTIONS = Object.entries(PRICE_FILTER_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ─── Pagination ───
export const EVENTS_PER_PAGE = 12;

// ─── Format helpers ───
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr));
}
