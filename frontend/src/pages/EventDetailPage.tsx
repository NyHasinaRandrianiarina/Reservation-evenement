import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import DOMPurify from 'dompurify';
import {
  CalendarDays,
  MapPin,
  Clock,
  Share2,
  Minus,
  Plus,
  Video,
  ChevronLeft,
} from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ErrorState from '@/components/shared/ErrorState';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';


export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError, error, refetch } = useEvent(slug || '');

  // Ticket selection state: mapping ticketId to quantity
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  // ─────────────────────────────────────────────────────────────────
  // Handlers & Helpers
  // ─────────────────────────────────────────────────────────────────
  const handleQuantityChange = (ticketId: string, delta: number, max: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[ticketId];
        return copy;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Découvrez ${event?.title} sur EventNest`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Optional: Add a toast notification here
      alert("Lien copié dans le presse-papier");
    }
  };

  const { initRegistration } = useRegistrationStore();

  const handleRegister = () => {
    if (totalQuantity === 0 || !event) return;
    initRegistration(event.slug, selectedTickets);
    navigate(`/events/${event.slug}/register/tickets`);
  };

  // ─────────────────────────────────────────────────────────────────
  // Computed values
  // ─────────────────────────────────────────────────────────────────
  const { totalQuantity, subtotal } = useMemo(() => {
    let q = 0;
    let s = 0;
    if (event) {
      Object.entries(selectedTickets).forEach(([id, qty]) => {
        const ticket = event.ticketTypes.find((t) => t.id === id);
        if (ticket) {
          q += qty;
          s += qty * ticket.price;
        }
      });
    }
    return { totalQuantity: q, subtotal: s };
  }, [selectedTickets, event]);

  const fee = subtotal > 0 ? subtotal * 0.05 : 0; // 5% service fee for paid tickets
  const total = subtotal + fee;

  // ─────────────────────────────────────────────────────────────────
  // Formatting
  // ─────────────────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString)).replace(':', 'h');
  };

  const sanitizedDescription = event
    ? DOMPurify.sanitize(event.description)
    : '';

  // ─────────────────────────────────────────────────────────────────
  // Render Loading/Error
  // ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Chargement de l'expérience...</p>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary pb-24 lg:pb-0">
      <title>{event.title} — EventNest</title>
      
      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative h-[60vh] lg:h-[70vh] flex items-end pb-12 px-6 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={event.coverImage} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10 -ml-3"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-widest font-black">
                {CATEGORY_LABELS[event.category]}
              </Badge>
              {event.status === 'sold_out' && (
                <Badge variant="destructive" className="px-3 py-1 text-xs uppercase tracking-widest font-black">
                  Complet
                </Badge>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span className="capitalize">{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                {event.location.type === 'online' ? (
                   <Video className="w-5 h-5 text-primary" />
                ) : (
                   <MapPin className="w-5 h-5 text-primary" />
                )}
                <span>
                  {event.location.type === 'online' 
                    ? 'Événement en ligne' 
                    : (event.location.venue || event.location.city)
                      ? `${event.location.venue || ''}${event.location.venue && event.location.city ? ', ' : ''}${event.location.city || ''}`
                      : (event.location.address || 'Lieu non spécifié')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTENT LAYOUT (Main + Sticky Aside)
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Main Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Description */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif italic tracking-wide text-foreground/90">
                  À propos de l'événement
                </h2>
                <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <div 
                className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-foreground/70 leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>

            {/* Informations Pratiques */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif italic tracking-wide text-foreground/90">
                Informations pratiques
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/40">
                  <Clock className="w-6 h-6 mb-4 text-primary" />
                  <h3 className="font-semibold mb-1">Date & Heure</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {formatDate(event.startDate)}<br />
                    De {formatTime(event.startDate)} à {formatTime(event.endDate)}
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/40">
                  {event.location.type === 'online' ? (
                    <Video className="w-6 h-6 mb-4 text-primary" />
                  ) : (
                    <MapPin className="w-6 h-6 mb-4 text-primary" />
                  )}
                  <h3 className="font-semibold mb-1">Lieu</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.location.type === 'online' ? (
                      'Lien de visioconférence fourni après inscription'
                    ) : (
                      <>
                        {event.location.venue && <>{event.location.venue}<br /></>}
                        {[
                          event.location.address,
                          [event.location.zipCode, event.location.city].filter(Boolean).join(' ')
                        ].filter(Boolean).join(', ') || 'Lieu non spécifié'}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif italic tracking-wide text-foreground/90">
                Organisateur
              </h2>
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-muted/30 border border-border/40">
                <img 
                  src={event.organizer.avatar} 
                  alt={event.organizer.name} 
                  className="w-16 h-16 rounded-full bg-muted object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{event.organizer.name}</h3>
                  {event.organizer.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.organizer.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Aside — Ticket Selector */}
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
            <div className="sticky top-32 glass rounded-[2.5rem] p-8 border border-border shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Billets disponibles</h3>
              
              <div className="space-y-4 mb-8">
                {event.ticketTypes.filter(t => t.visible).map((ticket) => {
                  const available = ticket.quota - ticket.sold;
                  const isSoldOut = available <= 0;
                  const currentQty = selectedTickets[ticket.id] || 0;
                  const maxAllowed = Math.min(available, ticket.maxPerOrder);

                  return (
                    <div 
                      key={ticket.id} 
                      className={cn(
                        "p-4 rounded-2xl border transition-colors",
                        currentQty > 0 ? "border-primary bg-primary/5" : "border-border/60 hover:border-border",
                        isSoldOut && "opacity-50 pointer-events-none"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{ticket.name}</h4>
                          <p className="text-xs text-muted-foreground">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">
                            {ticket.price === 0 ? 'Gratuit' : `${ticket.price.toFixed(2)} €`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <span className={cn(
                          "text-xs font-medium",
                          available <= 10 && available > 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {isSoldOut ? 'Épuisé' : `${available} restants`}
                        </span>
                        
                        {!isSoldOut && (
                          <div className="flex items-center gap-3 bg-background rounded-full border border-border/40 p-1">
                            <button
                              onClick={() => handleQuantityChange(ticket.id, -1, maxAllowed)}
                              disabled={currentQty === 0}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-semibold text-sm">{currentQty}</span>
                            <button
                              onClick={() => handleQuantityChange(ticket.id, 1, maxAllowed)}
                              disabled={currentQty >= maxAllowed}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalQuantity > 0 && (
                <div className="space-y-3 pt-6 border-t border-border/40 mb-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sous-total ({totalQuantity} billet{totalQuantity > 1 ? 's' : ''})</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Frais de service</span>
                      <span>{fee.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-border/40">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
                disabled={totalQuantity === 0}
                onClick={handleRegister}
              >
                S'inscrire
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold">
                Paiement sécurisé · Annulation selon politique
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MOBILE CTA BAR (Visible only on lg-)
      ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-50 lg:hidden transform transition-transform">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">
              {totalQuantity > 0 ? `${totalQuantity} billet(s)` : 'À partir de'}
            </span>
            <span className="font-bold text-lg leading-none">
              {totalQuantity > 0 
                ? `${total.toFixed(2)} €` 
                : (event.ticketTypes.filter(t => t.visible).sort((a,b) => a.price - b.price)[0]?.price === 0 
                    ? 'Gratuit' 
                    : `${event.ticketTypes.filter(t => t.visible).sort((a,b) => a.price - b.price)[0]?.price.toFixed(2)} €`)
              }
            </span>
          </div>
          <Button 
            className="flex-1 max-w-[200px] h-12 rounded-full font-bold shadow-lg shadow-primary/20"
            onClick={() => {
              // Si aucun billet sélectionné, on scroll vers le haut ou on ouvre un drawer.
              // Pour faire simple, sur mobile, si quantity == 0 on scroll vers les billets (qui seront affichés sous l'orga).
              if (totalQuantity === 0) {
                 window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              } else {
                 handleRegister();
              }
            }}
          >
            {totalQuantity > 0 ? "Continuer" : "Voir les billets"}
          </Button>
        </div>
      </div>

      {/* Rendu des billets en bas de page pour mobile */}
      <div className="lg:hidden px-6 pb-32">
        <h3 className="text-xl font-bold mb-6">Billets disponibles</h3>
        <div className="space-y-4">
          {event.ticketTypes.filter(t => t.visible).map((ticket) => {
            const available = ticket.quota - ticket.sold;
            const isSoldOut = available <= 0;
            const currentQty = selectedTickets[ticket.id] || 0;
            const maxAllowed = Math.min(available, ticket.maxPerOrder);

            return (
              <div 
                key={ticket.id} 
                className={cn(
                  "p-4 rounded-2xl border transition-colors bg-card",
                  currentQty > 0 ? "border-primary bg-primary/5" : "border-border/60",
                  isSoldOut && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{ticket.name}</h4>
                    <p className="text-xs text-muted-foreground">{ticket.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">
                      {ticket.price === 0 ? 'Gratuit' : `${ticket.price.toFixed(2)} €`}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <span className={cn(
                    "text-xs font-medium",
                    available <= 10 && available > 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {isSoldOut ? 'Épuisé' : `${available} restants`}
                  </span>
                  
                  {!isSoldOut && (
                    <div className="flex items-center gap-3 bg-background rounded-full border border-border/40 p-1">
                      <button
                        onClick={() => handleQuantityChange(ticket.id, -1, maxAllowed)}
                        disabled={currentQty === 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-semibold text-sm">{currentQty}</span>
                      <button
                        onClick={() => handleQuantityChange(ticket.id, 1, maxAllowed)}
                        disabled={currentQty >= maxAllowed}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
