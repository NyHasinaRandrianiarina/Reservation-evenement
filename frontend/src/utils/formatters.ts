/**
 * Formate un prix en Ariary malgache
 * @example formatPrice(12500) → "12 500 Ar"
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} Ar`;
}

/**
 * Formate une distance en km ou mètres
 * @example formatDistance(1.2) → "à 1,2 km"
 * @example formatDistance(0.4) → "à 400 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `à ${Math.round(km * 1000)} m`;
  }
  return `à ${km.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
}

/**
 * Formate une note avec une décimale
 * @example formatRating(4.8) → "4,8"
 */
export function formatRating(rating: number): string {
  return rating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Retourne le temps écoulé depuis une date ISO
 * @example timeAgo("2025-03-01") → "il y a 2 jours"
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'il y a 1 jour';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)} mois`;
  return `il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

/**
 * Formate un nombre de produits ou d'avis
 * @example formatCount(1200) → "1 200"
 */
export function formatCount(count: number): string {
  return count.toLocaleString('fr-FR');
}
