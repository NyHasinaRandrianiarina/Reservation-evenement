import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EventCalendar from '@/components/shared/EventCalendar';
import type { CalendarEvent } from '@/components/shared/EventCalendar';
import { getOrganizerEvents } from '@/api/events';
import { Loader2 } from 'lucide-react';

export default function OrgCalendarPage() {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: getOrganizerEvents,
  });

  const calendarEvents: CalendarEvent[] = (events || []).map(e => ({
    id: e.id,
    title: e.title,
    date: new Date(e.start_date),
    status: e.status,
    location: 'En ligne', // Temporary fallback since location is not in OrganizerEventRow
    type: 'organizer'
  }));

  const handleEventClick = (event: CalendarEvent) => {
    navigate(`/organizer/events/${event.id}`);
  };

  const handleDateClick = () => {
    // We could pass the date as state to the new event form, but for now just navigate
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2">Mon Calendrier</h1>
        <p className="text-muted-foreground">
          Gérez votre planning et planifiez vos prochains événements.
        </p>
      </div>

      <EventCalendar 
        events={calendarEvents} 
        mode="organizer" 
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />
    </div>
  );
}
