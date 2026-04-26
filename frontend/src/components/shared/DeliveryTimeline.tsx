import { Check } from 'lucide-react';
import type { DeliveryStatus } from './DeliveryStatusBadge';

// The logical order of statuses
const STATUS_ORDER: DeliveryStatus[] = [
  'PENDING',
  'CONFIRMED',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED'
];

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Demande soumise',
  CONFIRMED: 'Validée par l\'agence',
  ASSIGNED: 'Livreur assigné',
  IN_TRANSIT: 'En transit',
  DELIVERED: 'Livré au destinataire',
  COMPLETED: 'Livraison clôturée',
  CANCELLED: 'Annulée' // handled separately usually, but we include it for types
};

export interface TimelineEvent {
  status: DeliveryStatus;
  date: string;
  actor?: string;
}

interface Props {
  currentStatus: DeliveryStatus;
  events: TimelineEvent[];
}

export function DeliveryTimeline({ currentStatus, events }: Props) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100">
        <p className="font-bold text-sm">Livraison annulée</p>
        <p className="text-sm mt-1 font-medium">Cette demande de livraison a été annulée et n'est plus active.</p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-0 relative">
      {/* connecting line */}
      <div className="absolute left-[13px] top-5 bottom-5 w-[2px] bg-border z-0" />
      
      {STATUS_ORDER.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        
        // Find if we have an event for this status to show the date
        const event = events.find(e => e.status === status);

        let iconBg = "bg-background border-border/60";
        let iconColor = "text-muted-foreground/30";
        let titleColor = "text-muted-foreground/60";

        if (isPast) {
          iconBg = "bg-primary border-primary";
          iconColor = "text-primary-foreground";
          titleColor = "text-foreground font-semibold";
        } else if (isCurrent) {
          iconBg = "bg-background border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)] animate-pulse";
          iconColor = "text-primary";
          titleColor = "text-foreground font-bold";
        }

        return (
          <div key={status} className="flex gap-5 py-4 relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${iconBg} ${iconColor} transition-all`}>
              {isPast ? <Check size={14} strokeWidth={3} /> : <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/20'}`} />}
            </div>
            
            <div className="flex-1 pb-1 pt-0.5">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${titleColor}`}>
                  {STATUS_LABELS[status]}
                  {status === 'ASSIGNED' && event?.actor && <span className="text-muted-foreground font-medium ml-1.5">({event.actor})</span>}
                </p>
                {event && (
                  <p className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md font-medium border border-border/40">
                    {event.date}
                  </p>
                )}
                {!event && isFuture && (
                  <p className="text-xs text-muted-foreground/50 italic font-medium">En attente</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
