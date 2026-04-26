import { useState } from 'react';
import RegistrationCard from './components/RegistrationCard';
import type { RegistrationMock } from './components/RegistrationCard';
import { Ticket } from 'lucide-react';

const mockRegistrations: RegistrationMock[] = [
  {
    id: 'EVT-938102',
    eventTitle: 'MasterClass Design UX/UI avec Sarah Drasner',
    eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    date: 'Samedi 15 Mars 2025 · 14h00',
    location: 'Paris, Station F',
    ticketType: 'Place VIP',
    quantity: 1,
    status: 'upcoming'
  },
  {
    id: 'EVT-440219',
    eventTitle: 'Tech Summit 2024: Intelligence Artificielle',
    eventImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    date: 'Vendredi 10 Nov 2024 · 09h00',
    location: 'Lyon, Eurexpo',
    ticketType: 'Pass 2 Jours',
    quantity: 2,
    status: 'past'
  }
];

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationMock[]>(mockRegistrations);

  const handleCancel = (id: string) => {
    setRegistrations(prev => 
      prev.map(reg => reg.id === id ? { ...reg, status: 'cancelled' } : reg)
    );
  };

  const upcoming = registrations.filter(r => r.status === 'upcoming');
  const past = registrations.filter(r => r.status === 'past' || r.status === 'cancelled');

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-light tracking-tight">Mes Inscriptions</h1>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-serif italic text-foreground/80 flex items-center gap-3">
          À venir
          <span className="bg-primary text-primary-foreground text-xs font-sans not-italic px-2 py-0.5 rounded-full">
            {upcoming.length}
          </span>
        </h2>
        
        {upcoming.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-3xl">
             <p className="text-muted-foreground">Aucun événement à venir.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {upcoming.map(reg => (
              <RegistrationCard key={reg.id} registration={reg} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </section>

      {/* Past Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-serif italic text-foreground/80">Passés & Annulés</h2>
        
        {past.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-3xl">
             <p className="text-muted-foreground">Historique vide.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {past.map(reg => (
              <RegistrationCard key={reg.id} registration={reg} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
