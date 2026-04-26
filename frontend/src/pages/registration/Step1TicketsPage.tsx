import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, ChevronLeft } from 'lucide-react';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import { useEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import OrderSummary from './components/OrderSummary';

export default function Step1TicketsPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: event } = useEvent(slug || '');
  
  const { tickets: storeTickets, updateTickets } = useRegistrationStore();
  const [localTickets, setLocalTickets] = useState<Record<string, number>>({});

  useEffect(() => {
    // Sync local state with store on mount
    setLocalTickets(storeTickets);
  }, [storeTickets]);

  if (!event) return null;

  const handleQuantityChange = (ticketId: string, delta: number, max: number) => {
    setLocalTickets((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      const copy = { ...prev };
      if (next === 0) {
        delete copy[ticketId];
      } else {
        copy[ticketId] = next;
      }
      // Instantly update store so OrderSummary reacts
      updateTickets(copy);
      return copy;
    });
  };

  const totalQuantity = Object.values(localTickets).reduce((a, b) => a + b, 0);

  const handleContinue = () => {
    if (totalQuantity > 0) {
      updateTickets(localTickets);
      navigate(`/events/${slug}/register/info`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Left Column: Ticket Selection */}
      <div className="lg:col-span-7 xl:col-span-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/events/${slug}`)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour à l'événement
        </Button>

        <h2 className="text-3xl font-serif italic mb-8">Choisissez vos billets</h2>

        <div className="space-y-6">
          {event.ticketTypes.filter(t => t.visible).map((ticket) => {
            const available = ticket.quota - ticket.sold;
            const isSoldOut = available <= 0;
            const currentQty = localTickets[ticket.id] || 0;
            const maxAllowed = Math.min(available, ticket.maxPerOrder);

            return (
              <div 
                key={ticket.id} 
                className={cn(
                  "p-6 rounded-3xl border transition-colors bg-card",
                  currentQty > 0 ? "border-primary shadow-lg shadow-primary/5" : "border-border/60",
                  isSoldOut && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{ticket.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-bold font-serif">
                      {ticket.price === 0 ? 'Gratuit' : `${ticket.price.toFixed(2)} €`}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-6 pt-6 border-t border-border/40">
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      available <= 10 && available > 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {isSoldOut ? 'Épuisé' : `${available} places restantes`}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Max {ticket.maxPerOrder} par commande
                    </span>
                  </div>
                  
                  {!isSoldOut && (
                    <div className="flex items-center gap-4 bg-muted/50 rounded-full border border-border p-1.5">
                      <button
                        onClick={() => handleQuantityChange(ticket.id, -1, maxAllowed)}
                        disabled={currentQty === 0}
                        className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-foreground hover:text-background disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground transition-all shadow-sm"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-6 text-center font-bold text-lg">{currentQty}</span>
                      <button
                        onClick={() => handleQuantityChange(ticket.id, 1, maxAllowed)}
                        disabled={currentQty >= maxAllowed}
                        className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-foreground hover:text-background disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground transition-all shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5 xl:col-span-4">
        <OrderSummary 
          onContinue={handleContinue}
          isContinueDisabled={totalQuantity === 0}
        />
      </div>

    </div>
  );
}
