import { useState } from 'react';
import EventCalendar from '@/components/shared/EventCalendar';
import type { CalendarEvent } from '@/components/shared/EventCalendar';
import { Calendar as CalendarIcon, Users, Activity } from 'lucide-react';

// Mock data for admin calendar - represents events from ALL organizers
const getMockEvents = (baseDate: Date): CalendarEvent[] => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  return [
    {
      id: 'EVT-938102',
      title: 'MasterClass Design UX/UI',
      date: new Date(year, month, 15, 14, 0),
      location: 'Paris, Station F',
      status: 'published',
      type: 'admin'
    },
    {
      id: 'EVT-440219',
      title: 'Tech Summit 2024',
      date: new Date(year, month, 10, 9, 0),
      location: 'Lyon, Eurexpo',
      status: 'published',
      type: 'admin'
    },
    {
      id: 'EVT-112233',
      title: 'Atelier de photographie',
      date: new Date(year, month, 22, 10, 30),
      location: 'Studio 54, Bordeaux',
      status: 'sold_out',
      type: 'admin'
    },
    {
      id: 'EVT-998877',
      title: 'Soirée Networking',
      date: new Date(year, month, 28, 19, 0),
      location: 'Le Rooftop, Marseille',
      status: 'draft',
      type: 'admin'
    },
    {
      id: 'EVT-556677',
      title: 'Concert Symphonique',
      date: new Date(year, month, 5, 20, 0),
      location: 'Opéra de Paris',
      status: 'cancelled',
      type: 'admin'
    }
  ];
};

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // In a real app, this would fetch all platform events for the month
  const calendarEvents = getMockEvents(currentMonth);

  const stats = [
    { label: "Total Événements", value: String(calendarEvents.length), icon: CalendarIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Inscriptions (est.)", value: "1,248", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Taux d'activité", value: "94%", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Calendrier Global</h1>
        <p className="text-muted-foreground mt-1">Supervision de tous les événements prévus sur la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-4xl p-6 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Publié</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Complet</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
          <span>Brouillon</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="w-3 h-3 rounded-full bg-destructive"></div>
          <span>Annulé</span>
        </div>
      </div>

      <EventCalendar 
        events={calendarEvents} 
        mode="admin" 
        onMonthChange={setCurrentMonth}
      />
    </div>
  );
}
