import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Calendar, MapPin, Users, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getOrganizerById, getOrganizerPublicEvents } from "@/api/organizers";
import { CATEGORY_LABELS, formatPrice } from "@/lib/constants";
import { getMinPrice } from "@/types/event";
import type { Event } from "@/types/event";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveImage(src: string | undefined | null, fallback: string) {
  if (!src) return fallback;
  if (src.startsWith("blob:") || src.startsWith("http")) return src;
  return `${API_URL}${src}`;
}

// ─── Mini Event Card ───
function EventMiniCard({ event, index }: { event: Event; index: number }) {
  const minPrice = getMinPrice(event);
  const isPast = new Date(event.startDate) < new Date();
  const coverSrc = resolveImage(
    event.coverImage,
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/events/${event.slug}`}
        className={cn(
          "group flex flex-col sm:flex-row gap-5 p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500",
          isPast && "opacity-60"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-32 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
          <img
            src={coverSrc}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop";
            }}
          />
          {isPast && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">Passé</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <Badge
                variant="secondary"
                className="text-[9px] font-black uppercase tracking-widest shrink-0"
              >
                {CATEGORY_LABELS[event.category]}
              </Badge>
              {event.status === "sold_out" && (
                <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest">
                  Complet
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-lg font-light text-foreground group-hover:text-primary transition-colors line-clamp-1 mt-1">
              {event.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(event.startDate))}
              </span>
              {event.location.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {event.location.city}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {minPrice === null ? "" : minPrice === 0 ? "Gratuit" : formatPrice(minPrice)}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ───
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[45vh] bg-muted animate-pulse" />
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-lg" />
        <Skeleton className="h-5 w-full max-w-sm" />
        <div className="grid grid-cols-1 gap-4 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function OrganizerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: organizer, isLoading: loadingProfile } = useQuery({
    queryKey: ["organizer", id],
    queryFn: () => getOrganizerById(id!),
    enabled: !!id,
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["organizer", id, "events"],
    queryFn: () => getOrganizerPublicEvents(id!),
    enabled: !!id,
  });

  if (loadingProfile) return <DetailSkeleton />;

  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center px-6">
        <Users className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-serif font-light">Organisateur introuvable</h2>
        <Button variant="outline" onClick={() => navigate("/organisateurs")}>
          Voir tous les organisateurs
        </Button>
      </div>
    );
  }

  const avatarSrc = resolveImage(
    organizer.avatar,
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizer.name)}`
  );

  const upcoming = events?.upcoming ?? [];
  const past = events?.past ?? [];
  const totalEvents = upcoming.length + past.length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <title>{organizer.name} — EventNest</title>

      {/* ── Hero Section ── */}
      <section className="relative bg-black overflow-hidden">
        {/* Background ambiance */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/70 to-black z-10" />
          <div
            className="w-full h-full bg-cover bg-center opacity-20 blur-sm scale-105"
            style={{ backgroundImage: `url(${avatarSrc})` }}
          />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 pt-8 pb-16">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/organisateurs")}
            className="mb-10 text-white/60 hover:text-white hover:bg-white/10 -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Tous les organisateurs
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center sm:items-end gap-8"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={avatarSrc}
                alt={organizer.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/10 shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizer.name)}`;
                }}
              />
              <div className="absolute -bottom-2 -right-2 bg-primary/90 rounded-full p-2.5 border-2 border-background">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-2">
                Organisateur certifié
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-white tracking-tight leading-none mb-4">
                {organizer.name}
              </h1>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="font-bold text-white">{totalEvents}</span>
                  <span>événement{totalEvents > 1 ? "s" : ""} organisé{totalEvents > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold text-white">{upcoming.length}</span>
                  <span>à venir</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left: Description */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-28"
            >
              <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-6">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
                    À propos
                  </h2>
                  {organizer.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {organizer.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Cet organisateur n'a pas encore ajouté de description.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Événements à venir</span>
                    <span className="font-bold text-foreground">{upcoming.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Événements passés</span>
                    <span className="font-bold text-foreground">{past.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Events */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Tabs defaultValue="upcoming">
                <TabsList className="rounded-full h-12 px-1 mb-8 w-full sm:w-auto">
                  <TabsTrigger value="upcoming" className="rounded-full px-6 h-10 data-[state=active]:shadow-md">
                    À venir
                    {upcoming.length > 0 && (
                      <span className="ml-2 text-[10px] font-black bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                        {upcoming.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past" className="rounded-full px-6 h-10 data-[state=active]:shadow-md">
                    Passés
                    {past.length > 0 && (
                      <span className="ml-2 text-[10px] font-black bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                        {past.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Upcoming */}
                <TabsContent value="upcoming">
                  {loadingEvents ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                      ))}
                    </div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border/40 rounded-3xl">
                      <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-light">
                        Aucun événement à venir pour cet organisateur.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-4">
                        {upcoming.map((event, i) => (
                          <EventMiniCard key={event.id} event={event} index={i} />
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </TabsContent>

                {/* Past */}
                <TabsContent value="past">
                  {loadingEvents ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                      ))}
                    </div>
                  ) : past.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border/40 rounded-3xl">
                      <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-light">
                        Cet organisateur n'a pas encore d'événements passés.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-4">
                        {past.map((event, i) => (
                          <EventMiniCard key={event.id} event={event} index={i} />
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
