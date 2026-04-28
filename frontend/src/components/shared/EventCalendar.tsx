import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, CalendarDays, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@/components/reusable/Button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  status?: string;
  location?: string;
  type?: 'organizer' | 'reserved' | 'invited' | 'admin';
  image?: string;
};

interface EventCalendarProps {
  events: CalendarEvent[];
  mode: 'organizer' | 'participant' | 'admin';
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onMonthChange?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function EventCalendar({ events, mode, onDateClick, onEventClick, onMonthChange }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const navigate = useNavigate();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDate = (day: number) => {
    return events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === day && 
             eDate.getMonth() === currentDate.getMonth() && 
             eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const selectedEvents = selectedDate ? events.filter(e => {
    const eDate = new Date(e.date);
    return eDate.getDate() === selectedDate.getDate() && 
           eDate.getMonth() === selectedDate.getMonth() && 
           eDate.getFullYear() === selectedDate.getFullYear();
  }) : [];

  const getEventBadgeProps = (type?: string, status?: string) => {
    if (type === 'reserved') return { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Réservé' };
    if (type === 'invited') return { className: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Invité' };
    
    if (status === 'published') return { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Publié' };
    if (status === 'draft') return { className: 'bg-muted text-muted-foreground', label: 'Brouillon' };
    if (status === 'sold_out') return { className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Complet' };
    if (status === 'cancelled') return { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Annulé' };
    
    return { className: 'bg-primary/10 text-primary border-primary/20', label: 'Événement' };
  };

  const getDotColor = (event: CalendarEvent) => {
    if (event.type === 'reserved') return 'bg-emerald-500';
    if (event.type === 'invited') return 'bg-purple-500';
    if (event.status === 'published') return 'bg-blue-500';
    if (event.status === 'draft') return 'bg-muted-foreground';
    if (event.status === 'sold_out') return 'bg-amber-500';
    if (event.status === 'cancelled') return 'bg-destructive';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Calendar View */}
      <div className="flex-1 bg-card rounded-3xl p-6 lg:p-8 border border-border shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-light capitalize">
            {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate)}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full w-10 h-10">
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full w-10 h-10">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="aspect-square rounded-2xl bg-muted/20"></div>
          ))}
          
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isSel = isSelected(day);
            const isTod = isToday(day);
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 transition-all group hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isSel && "bg-foreground text-background hover:bg-foreground shadow-lg shadow-foreground/20",
                  isTod && !isSel && "border border-primary text-primary font-bold"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSel ? "text-background" : "text-foreground"
                )}>
                  {day}
                </span>
                
                <div className="flex gap-1 mt-auto pb-2 flex-wrap justify-center px-1">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSel ? "bg-background/80" : getDotColor(e)
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", isSel ? "bg-background/50" : "bg-muted-foreground")} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-xl h-full flex flex-col">
          <h3 className="text-lg font-serif font-light mb-6 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {selectedDate ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate) : 'Sélectionnez une date'}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {selectedEvents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground"
                >
                  <p className="text-sm mb-4">Aucun événement prévu</p>
                  {mode === 'organizer' && (
                    <Button 
                      size="sm" 
                      className="rounded-full px-6"
                      onClick={() => navigate('/organizer/events/new')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un événement
                    </Button>
                  )}
                </motion.div>
              ) : (
                selectedEvents.map((event) => {
                  const badge = getEventBadgeProps(event.type, event.status);
                  
                  return (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => onEventClick?.(event)}
                      className="group relative p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Badge variant="outline" className={cn("absolute -top-2 -right-2 font-bold uppercase tracking-widest text-[8px]", badge.className)}>
                        {badge.label}
                      </Badge>
                      <h4 className="font-bold text-sm mb-2 pr-8">{event.title}</h4>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.date))}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border/50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                          Voir détails <ExternalLink size={10} />
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
}
