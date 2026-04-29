import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, MapPin, ArrowRight, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPublicEvents } from "@/api/events";
import type { Event } from "@/api/events";
// import { cn } from "@/lib/utils";

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchOverlay({ isOpen, onClose }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // For now, we fetch all public events and filter them
        // In a real app, this would be a backend search endpoint
        const allEvents = await getPublicEvents();
        const filtered = allEvents.filter(event => 
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.category.toLowerCase().includes(query.toLowerCase()) ||
          event.organizer.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleResultClick = (id: string) => {
    onClose();
    navigate(`/events/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-200 flex flex-col items-center justify-start pt-[15vh] px-6"
        >
          {/* Solid Backdrop for better readability */}
          <div 
            className="absolute inset-0 bg-background/95"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl relative z-10"
          >
            {/* Search Input Box - Simplified */}
            <div className="relative">
              <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-2 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ml-2">
                  <Search className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher un événement, un organisateur..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-lg font-medium placeholder:text-muted-foreground/50 py-4"
                />
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors mr-2 shrink-0"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {query.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border/30 bg-muted/20">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-4">
                      {isLoading ? "Recherche en cours..." : results.length > 0 ? `${results.length} résultats trouvés` : "Aucun résultat"}
                    </span>
                  </div>

                  <div className="p-2 flex flex-col gap-1">
                    {isLoading && (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <p className="text-sm">Recherche en cours...</p>
                      </div>
                    )}

                    {!isLoading && results.length > 0 && results.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleResultClick(event.id)}
                        className="flex items-center gap-6 p-4 rounded-3xl hover:bg-foreground/5 transition-all text-left group w-full"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border/50 shrink-0 bg-muted">
                          {event.coverImage ? (
                            <img src={event.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Calendar className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {event.category}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate">{event.organizer.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {typeof event.location === 'object' && event.location !== null && 'address' in event.location 
                                  ? event.location.address as string
                                  : "Lieu non spécifié"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shrink-0">
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                        </div>
                      </button>
                    ))}

                    {!isLoading && query.length >= 2 && results.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-serif italic">Nous n'avons rien trouvé pour "{query}"</p>
                      </div>
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="p-4 border-t border-border/30 text-center">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                        Voir tous les résultats
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions when no query */}
            {!query && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Catégories populaires</h5>
                  <div className="flex flex-wrap gap-2">
                    {["Concert", "Workshop", "Conférence", "Networking", "Sport"].map(cat => (
                      <button key={cat} onClick={() => setQuery(cat)} className="px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Villes actives</h5>
                  <div className="flex flex-wrap gap-2">
                    {["Paris", "Lyon", "Marseille", "Bordeaux", "Lille"].map(city => (
                      <button key={city} onClick={() => setQuery(city)} className="px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold">
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
