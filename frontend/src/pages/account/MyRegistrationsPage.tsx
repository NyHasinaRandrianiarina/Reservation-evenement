import { useEffect, useMemo, useState } from 'react';
import RegistrationCard from './components/RegistrationCard';
import type { RegistrationItem } from './components/RegistrationCard';
import { Ticket, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cancelMyRegistration, getMyRegistrations, type ParticipantRegistration } from '@/api/registrations';
import toast from 'react-hot-toast';

function formatDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getLocationLabel(location: ParticipantRegistration["event"]["location"]): string {
  if (!location) return 'Lieu à confirmer';
  if (location.type === 'online') return 'En ligne';
  return location.venue || location.address || location.city || 'Lieu à confirmer';
}

function toRegistrationItem(reg: ParticipantRegistration): RegistrationItem {
  const now = Date.now();
  const eventDate = new Date(reg.event.start_date).getTime();
  const mappedStatus: RegistrationItem["status"] =
    reg.status === 'cancelled' ? 'cancelled' : eventDate < now ? 'past' : 'upcoming';

  const firstTicketId = Object.keys(reg.tickets ?? {})[0];
  const eventTickets = Array.isArray(reg.event.tickets) ? reg.event.tickets : [];
  const firstTicketName =
    eventTickets.find((t) => t?.id === firstTicketId)?.name ??
    firstTicketId ??
    'Billet';

  return {
    id: reg.id,
    eventTitle: reg.event.title,
    eventImage: reg.event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    date: formatDate(reg.event.start_date),
    location: getLocationLabel(reg.event.location),
    ticketType: firstTicketName,
    quantity: reg.total_quantity,
    status: mappedStatus,
  };
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getMyRegistrations();
        setRegistrations((res.data ?? []).map(toRegistrationItem));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les inscriptions";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await cancelMyRegistration(id);
      setRegistrations((prev) => prev.map((reg) => (reg.id === id ? { ...reg, status: 'cancelled' } : reg)));
      toast.success("Inscription annulée");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'annuler l'inscription";
      toast.error(message);
    }
  };

  const upcoming = useMemo(() => registrations.filter(r => r.status === 'upcoming'), [registrations]);
  const past = useMemo(() => registrations.filter(r => r.status === 'past' || r.status === 'cancelled'), [registrations]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-light tracking-tight">Mes Inscriptions</h1>
        </div>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-serif italic text-foreground/80 flex items-center gap-3">
          À venir
          <span className="bg-primary text-primary-foreground text-xs font-sans not-italic px-2 py-0.5 rounded-full">
            {upcoming.length}
          </span>
        </h2>
        
        {isLoading ? (
          <div className="p-8 text-center border border-dashed border-border rounded-3xl">
             <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : upcoming.length === 0 ? (
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
        
        {isLoading ? (
          <div className="p-8 text-center border border-dashed border-border rounded-3xl">
             <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : past.length === 0 ? (
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
