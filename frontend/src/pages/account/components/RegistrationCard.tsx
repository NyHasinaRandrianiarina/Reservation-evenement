import { useState } from 'react';
import { MapPin, CalendarDays, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TicketModal from './TicketModal';

export interface RegistrationItem {
  id: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  location: string;
  ticketType: string;
  quantity: number;
  status: 'upcoming' | 'past' | 'cancelled';
}

interface RegistrationCardProps {
  registration: RegistrationItem;
  onCancel?: (id: string) => void;
}

export default function RegistrationCard({ registration, onCancel }: RegistrationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPast = registration.status === 'past';
  const isCancelled = registration.status === 'cancelled';

  const handleCancel = () => {
    if (onCancel && confirm("Êtes-vous sûr de vouloir annuler cette inscription ?")) {
      onCancel(registration.id);
    }
  };

  return (
    <>
      <div className="glass rounded-4xl p-6 border border-border flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden transition-all hover:shadow-xl group">
        <div className="w-full sm:w-40 h-40 sm:h-32 rounded-2xl overflow-hidden shrink-0 relative">
          <img 
            src={registration.eventImage} 
            alt={registration.eventTitle} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {isPast && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-xs">
              <Badge variant="secondary" className="uppercase tracking-widest font-bold">Terminé</Badge>
            </div>
          )}
          {isCancelled && (
            <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center backdrop-blur-xs">
              <Badge variant="destructive" className="uppercase tracking-widest font-bold bg-background text-destructive hover:bg-background">Annulé</Badge>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <h3 className="text-xl font-bold truncate pr-4">{registration.eventTitle}</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>{registration.date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{registration.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
             <TicketIcon className="w-4 h-4" />
             <span>{registration.ticketType}</span>
             <span className="text-muted-foreground ml-2">× {registration.quantity}</span>
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col gap-3 shrink-0 mt-4 sm:mt-0">
          {!isCancelled && (
            <Button 
              className="w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/10 px-8"
              onClick={() => setIsModalOpen(true)}
            >
              {isPast ? "Voir la fiche" : "Voir mon billet"}
            </Button>
          )}
          
          {!isPast && !isCancelled && (
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
            >
              Annuler
            </Button>
          )}
        </div>
      </div>

      <TicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        registration={registration} 
      />
    </>
  );
}
