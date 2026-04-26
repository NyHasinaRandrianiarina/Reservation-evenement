import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, formatPrice, formatDateShort } from '@/lib/constants';
import { getMinPrice, getRemainingCapacity, isAlmostFull } from '@/types/event';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const minPrice = getMinPrice(event);
  const remaining = getRemainingCapacity(event);
  const almostFull = isAlmostFull(event);
  const isSoldOut = event.status === 'sold_out';
  const isPast = event.status === 'past';
  const city = event.location.city ?? (event.location.type === 'online' ? 'En ligne' : '');

  return (
    <Link
      to={`/events/${event.slug}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        (isSoldOut || isPast) && 'opacity-80',
        className
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-background/80 backdrop-blur-sm text-foreground border-0"
        >
          {CATEGORY_LABELS[event.category]}
        </Badge>

        {/* Status overlay badges */}
        {isSoldOut && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-destructive text-destructive-foreground border-0 text-xs font-bold">
              Complet
            </Badge>
          </div>
        )}
        {isPast && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-muted/90 text-muted-foreground border-0 text-xs font-medium">
              Terminé
            </Badge>
          </div>
        )}
        {almostFull && !isSoldOut && !isPast && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-destructive/90 text-destructive-foreground border-0 text-xs font-medium animate-pulse">
              Plus que {remaining} places
            </Badge>
          </div>
        )}

        {/* Price tag */}
        {minPrice !== null && (
          <div className="absolute bottom-3 right-3">
            <span className="text-sm font-bold text-white drop-shadow-md">
              {minPrice === 0 ? 'Gratuit' : `Dès ${formatPrice(minPrice)}`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="text-base font-semibold text-card-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDateShort(event.startDate)}</span>
          </div>

          {city && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{city}</span>
            </div>
          )}

          {event.capacity && !isPast && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>
                {event.totalSold} / {event.capacity} inscrits
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
