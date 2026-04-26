import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, formatPrice, formatDateShort } from '@/lib/constants';
import { getMinPrice, getRemainingCapacity, isAlmostFull } from '@/types/event';
import type { Event } from '@/types/event';
import { motion } from 'motion/react';

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
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/events/${event.slug}`}
        className={cn(
          'group relative flex flex-col rounded-[2rem] border border-border/40 bg-card overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500',
          (isSoldOut || isPast) && 'opacity-80 grayscale-[0.5]',
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <Badge
              className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1"
            >
              {CATEGORY_LABELS[event.category]}
            </Badge>

            <div className="flex flex-col gap-2 items-end">
              {isSoldOut && (
                <Badge className="bg-destructive/90 backdrop-blur-md text-white border-0 text-[10px] font-black uppercase tracking-wider">
                  Complet
                </Badge>
              )}
              {isPast && (
                <Badge className="bg-muted/90 backdrop-blur-md text-muted-foreground border-0 text-[10px] font-black uppercase tracking-wider">
                  Terminé
                </Badge>
              )}
              {almostFull && !isSoldOut && !isPast && (
                <Badge className="bg-primary backdrop-blur-md text-primary-foreground border-0 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  {remaining} places
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex flex-col">
              {city && (
                <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-bold uppercase tracking-widest drop-shadow-sm">
                  <MapPin size={12} className="text-primary" />
                  {city}
                </div>
              )}
            </div>
            
            {minPrice !== null && (
              <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-lg">
                {minPrice === 0 ? 'OFFERT' : formatPrice(minPrice)}
              </div>
            )}
          </div>

          {/* Hover Action Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.2em] uppercase">
            <CalendarDays size={12} />
            {formatDateShort(event.startDate)}
          </div>
          
          <h3 className="text-lg font-bold text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
            {event.title}
          </h3>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/40">
             {event.capacity ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}${i}`} alt="avatar" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {event.totalSold} participants
                  </span>
                </div>
             ) : (
               <div />
             )}
             
             <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
               Détails
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}