import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EventCalendar from '@/components/shared/EventCalendar';
import type { CalendarEvent } from '@/components/shared/EventCalendar';
import { getMyRegistrations, type ParticipantRegistration } from '@/api/registrations';
import toast from 'react-hot-toast';

function getLocationLabel(location: ParticipantRegistration["event"]["location"]): string {
  if (!location) return 'Lieu à confirmer';
  if (location.type === 'online') return 'En ligne';
  return location.venue || location.address || location.city || 'Lieu à confirmer';
}

export default function ParticipantCalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [registrations, setRegistrations] = useState<ParticipantRegistration[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyRegistrations();
        setRegistrations(res.data ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger le calendrier";
        toast.error(message);
      }
    };
    load();
  }, []);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    return registrations
      .filter((reg) => reg.status !== 'cancelled')
      .map((reg) => {
        const date = new Date(reg.event.start_date);
        return {
          id: reg.id,
          title: reg.event.title,
          date,
          location: getLocationLabel(reg.event.location),
          type: 'reserved' as const,
          status: reg.event.status,
        };
      })
      .filter((event) => event.date.getMonth() === month && event.date.getFullYear() === year);
  }, [registrations, currentMonth]);

  const handleEventClick = (event: CalendarEvent) => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2">Mon Calendrier</h1>
        <p className="text-muted-foreground">
          Retrouvez les événements auxquels vous êtes inscrit ou invité.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Invité</span>
        </div>
      </div>

      <EventCalendar 
        events={calendarEvents} 
        mode="participant" 
        onEventClick={handleEventClick}
        onMonthChange={setCurrentMonth}
      />
    </div>
  );
}
