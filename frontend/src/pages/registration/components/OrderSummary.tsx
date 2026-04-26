import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import { useEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  onContinue?: () => void;
  continueLabel?: string;
  isContinueDisabled?: boolean;
  isLoading?: boolean;
  isFinal?: boolean; // For step 3
  compact?: boolean; // For step 2 mobile or sidebars
}

export default function OrderSummary({
  onContinue,
  continueLabel = "Continuer",
  isContinueDisabled = false,
  isLoading = false,
  isFinal = false,
  compact = false,
}: OrderSummaryProps) {
  const { slug } = useParams<{ slug: string }>();
  const { data: event } = useEvent(slug || '');
  const tickets = useRegistrationStore((state) => state.tickets);

  const { totalQuantity, subtotal } = useMemo(() => {
    let q = 0;
    let s = 0;
    if (event) {
      Object.entries(tickets).forEach(([id, qty]) => {
        const ticket = event.ticketTypes.find((t) => t.id === id);
        if (ticket) {
          q += qty;
          s += qty * ticket.price;
        }
      });
    }
    return { totalQuantity: q, subtotal: s };
  }, [tickets, event]);

  const fee = subtotal > 0 ? subtotal * 0.05 : 0;
  const total = subtotal + fee;

  if (!event || totalQuantity === 0) {
    return (
      <div className="glass rounded-4xl p-8 border border-border shadow-xl">
        <h3 className="text-xl font-bold mb-4">Votre commande</h3>
        <p className="text-muted-foreground text-sm">Aucun billet sélectionné.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-4xl p-6 lg:p-8 border border-border shadow-2xl flex flex-col h-full max-h-min sticky top-24">
      {!compact && <h3 className="text-xl font-bold mb-6">Récapitulatif</h3>}
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6">
        {Object.entries(tickets).map(([id, qty]) => {
          if (qty === 0) return null;
          const ticket = event.ticketTypes.find((t) => t.id === id);
          if (!ticket) return null;
          return (
            <div key={id} className="flex justify-between items-start text-sm">
              <div>
                <span className="font-semibold">{ticket.name}</span>
                <span className="text-muted-foreground mx-2">×</span>
                <span className="font-bold">{qty}</span>
              </div>
              <span className="font-medium text-foreground/80">
                {ticket.price === 0 ? 'Gratuit' : `${(ticket.price * qty).toFixed(2)} €`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-6 border-t border-border/40">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Sous-total HT</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        {fee > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Frais de service (5%)</span>
            <span>{fee.toFixed(2)} €</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold pt-4 border-t border-border/40">
          <span>Total TTC</span>
          <span>{total === 0 ? "Gratuit" : `${total.toFixed(2)} €`}</span>
        </div>
      </div>

      {!isFinal && onContinue && (
        <div className="mt-8">
          <Button 
            className="w-full h-14 rounded-full text-base font-bold shadow-xl shadow-primary/20"
            disabled={isContinueDisabled || isLoading}
            onClick={onContinue}
          >
            {isLoading ? "Traitement..." : continueLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
