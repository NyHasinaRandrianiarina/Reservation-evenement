import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Search, Users, CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizers } from "@/api/organizers";
import type { OrganizerProfile } from "@/api/organizers";

// ─── Skeleton ───
function OrganizerCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-border/40 bg-card gap-4">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-28 rounded-full mt-2" />
    </div>
  );
}

// ─── Card ───
function OrganizerCard({ organizer, index }: { organizer: OrganizerProfile; index: number }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const avatarSrc = organizer.avatar?.startsWith("http")
    ? organizer.avatar
    : `${API_URL}${organizer.avatar}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/organisateurs/${organizer.id}`}
        className="group flex flex-col items-center text-center p-8 rounded-3xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full"
      >
        {/* Avatar */}
        <div className="relative mb-5">
          <img
            src={avatarSrc}
            alt={organizer.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-border/40 group-hover:border-primary/40 transition-colors duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizer.name)}`;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary/20 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Name */}
        <h2 className="text-xl font-serif font-light text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
          {organizer.name}
        </h2>

        {/* Description */}
        {organizer.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {organizer.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-auto pt-4 border-t border-border/40 w-full flex justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{organizer.eventsCount}</span>
            {organizer.eventsCount > 1 ? "événements" : "événement"}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ───
export default function OrganizersPage() {
  const [search, setSearch] = useState("");

  const { data: organizers = [], isLoading, isError } = useQuery({
    queryKey: ["organizers"],
    queryFn: getOrganizers,
  });

  const filtered = organizers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>Organisateurs — EventNest</title>

      {/* ── Hero ── */}
      <section className="relative bg-black py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/70 to-black z-10" />
          <img
            src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop"
            alt="Organisateurs"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-8">
              <div className="w-8 h-px bg-white/40" />
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                Les créateurs d'expériences
              </span>
              <div className="w-8 h-px bg-white/40" />
            </div>

            <h1 className="text-5xl sm:text-7xl font-serif font-light text-white tracking-tight leading-[1.1] mb-8">
              Nos <span className="italic opacity-90">organisateurs</span>
            </h1>

            <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed font-light">
              Découvrez les créatifs et professionnels qui façonnent les événements de demain.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <section className="max-w-2xl mx-auto px-6 -mt-7 relative z-10 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-4xl px-6 py-3 flex items-center gap-4 border border-border/40 shadow-2xl bg-background/60 backdrop-blur-xl"
        >
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un organisateur..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base font-light placeholder:text-muted-foreground/60 h-12"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </section>

      {/* ── Grid ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-light text-foreground/90">
              {search ? `Résultats pour "${search}"` : "Tous les organisateurs"}
            </h2>
            {!isLoading && (
              <div className="mt-3 text-[11px] font-bold text-foreground/40 tracking-[0.4em] uppercase flex items-center gap-3">
                <div className="w-8 h-px bg-border" />
                {filtered.length} organisateur{filtered.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <OrganizerCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-24">
            <p className="text-muted-foreground">Impossible de charger les organisateurs pour le moment.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-light mb-3">Aucun organisateur trouvé</h3>
            <p className="text-muted-foreground">Modifiez votre recherche ou consultez toute la liste.</p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((organizer, index) => (
                <OrganizerCard key={organizer.id} organizer={organizer} index={index} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
