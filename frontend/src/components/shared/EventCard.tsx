import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, formatPrice } from '@/lib/constants';
import { getMinPrice, isAlmostFull } from '@/types/event';
import type { Event } from '@/types/event';
import { motion } from 'motion/react';

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const minPrice = getMinPrice(event);
  const almostFull = isAlmostFull(event);
  const isSoldOut = event.status === 'sold_out';
  const isPast = event.status === 'past';
  const city = event.location.city ?? (event.location.type === 'online' ? 'Online' : '');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link
        to={`/events/${event.slug}`}
        className={cn(
          'relative flex flex-col overflow-hidden transition-all duration-700 h-full',
          (isSoldOut || isPast) && 'opacity-70 grayscale-[0.3]',
          className
        )}
      >
        {/* Cinematic Image Container - Taller 3:4 aspect ratio */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] bg-black">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />

          {/* Vignette Overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/80 z-10" />
          
          {/* Bottom Gradient for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" />
          
          {/* Top Info */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 border border-white/20 px-3 py-1 backdrop-blur-md rounded-sm">
              {CATEGORY_LABELS[event.category]}
            </span>

            <div className="flex flex-col gap-2 items-end">
              {isSoldOut && (
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-3 py-1 rounded-sm border border-red-500/20 backdrop-blur-md">
                  Complet
                </span>
              )}
              {almostFull && !isSoldOut && !isPast && (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-white/10 px-3 py-1 rounded-sm border border-white/20 backdrop-blur-md">
                  Places limitées
                </span>
              )}
            </div>
          </div>

          {/* Bottom Info inside the image */}
          <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                {city && (
                  <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                    <MapPin size={12} className="text-white/40" />
                    {city}
                  </div>
                )}
                
                {minPrice !== null && (
                  <div className="text-white text-xs font-mono font-light tracking-wide">
                    {minPrice === 0 ? 'OFFERT' : formatPrice(minPrice)}
                  </div>
                )}
             </div>

             <h3 className="text-2xl font-serif font-light text-white leading-tight line-clamp-2">
               {event.title}
             </h3>
             
             {/* Hover Action */}
             <div className="overflow-hidden h-0 group-hover:h-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 group-hover:opacity-100 mt-2 flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
               Découvrir
               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}