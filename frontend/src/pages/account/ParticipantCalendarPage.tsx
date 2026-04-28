import { useState } from 'react';

import EventCalendar from '@/components/shared/EventCalendar';
import type { CalendarEvent } from '@/components/shared/EventCalendar';

// Mock data for participant calendar
const getMockEvents = (baseDate: Date): CalendarEvent[] => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  return [
    {
      id: 'EVT-938102',
      title: 'MasterClass Design UX/UI avec Sarah Drasner',
      date: new Date(year, month, 15, 14, 0),
      location: 'Paris, Station F',
      type: 'reserved',
      status: 'published'
    },
    {
      id: 'EVT-440219',
      title: 'Tech Summit 2024: Intelligence Artificielle',
      date: new Date(year, month, 10, 9, 0),
      location: 'Lyon, Eurexpo',
      type: 'reserved',
      status: 'published'
    },
    {
      id: 'EVT-112233',
      title: 'Atelier de photographie culinaire',
      date: new Date(year, month, 22, 10, 30),
      location: 'Studio 54, Bordeaux',
      type: 'invited',
      status: 'published'
    },
    {
      id: 'EVT-998877',
      title: 'Soirée Networking Startup',
      date: new Date(year, month, 28, 19, 0),
      location: 'Le Rooftop, Marseille',
      type: 'invited',
      status: 'published'
    }
  ];
};

export default function ParticipantCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // In a real app, this would be a React Query fetching events by month
  const calendarEvents = getMockEvents(currentMonth);

  const handleEventClick = () => {
    // For participants, they view the public event page or their ticket details
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
