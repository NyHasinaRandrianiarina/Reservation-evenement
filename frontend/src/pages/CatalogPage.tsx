import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import {
  Search,
  CalendarX,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EventCard from '@/components/shared/EventCard';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { useEvents } from '@/hooks/useEvents';
import {
  CATEGORY_OPTIONS,
  DATE_FILTER_OPTIONS,
  PRICE_FILTER_OPTIONS,
  CATEGORY_LABELS,
} from '@/lib/constants';
import type {
  EventCategory,
  DateFilter,
  PriceFilter,
} from '@/types/event';
import { cn } from '@/lib/utils';

// ─── Debounce hook ───
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ═══════════════════════════════════════════════
//  HERO BANNER
// ═══════════════════════════════════════════════
function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-black py-20 px-6">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black z-10" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
            alt="Event Background" 
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-20 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-8">
            <div className="w-8 h-[1px] bg-white/40" />
            <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">
              La Collection Privée
            </span>
            <div className="w-8 h-[1px] bg-white/40" />
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-light text-white tracking-tight leading-[1.1] mb-8 drop-shadow-2xl">
            L'art de vivre des <br />
            <span className="italic opacity-90">moments d'exception.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
            Découvrez une sélection rigoureuse d'événements exclusifs. 
            Des masterclasses, des soirées privées, et des expériences inoubliables.
          </p>
        </motion.div>
      </div>

      {/* Subtle scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">Découvrir</span>
        <div className="w-[1px] h-12 bg-linear-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════
//  FILTER BAR — REVISITED FOR UX
// ═══════════════════════════════════════════════
interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  priceType: string;
  onPriceTypeChange: (val: string) => void;
  activeCount: number;
  onReset: () => void;
}

function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  priceType,
  onPriceTypeChange,
  activeCount,
  onReset,
}: FilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // On active le mode sticky après le Hero (~450px)
    setIsSticky(latest > 450);
  });

  const CategoryPills = () => (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {CATEGORY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onCategoryChange(opt.value)}
          className={cn(
            "whitespace-nowrap px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer",
            category === opt.value
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "bg-background text-muted-foreground border-border/40 hover:border-primary/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={cn(
      "z-40 transition-all duration-700 w-full",
      isSticky ? "fixed top-6 left-0 px-4" : "relative px-6 -mt-10"
    )}>
      <motion.div 
        layout
        className={cn(
          "max-w-4xl mx-auto transition-all duration-700 glass rounded-[2rem]",
          isSticky 
            ? "bg-black/60 shadow-2xl p-2 pl-6 border-white/10" 
            : "bg-black/40 p-2 pl-6 shadow-xl border-white/10"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Search — Minimalist & elegant */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Que recherchez-vous ?"
              className="pl-14 rounded-full border-transparent bg-transparent focus:bg-white/5 text-white placeholder:text-white/40 transition-all h-12 lg:h-14 text-base font-light outline-none ring-0 focus-visible:ring-0 shadow-none"
            />
          </div>

          <div className="flex items-center gap-2 pr-2">
             <div className="hidden md:flex items-center gap-2">
                {/* Selects seulement si pas sticky ou sur grand écran */}
                {!isSticky && (
                  <>
                    <Select value={dateRange} onValueChange={onDateRangeChange}>
                      <SelectTrigger className="w-36 h-12 rounded-full border-transparent bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors focus:ring-0 shadow-none">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                        {DATE_FILTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={priceType} onValueChange={onPriceTypeChange}>
                      <SelectTrigger className="w-32 h-12 rounded-full border-transparent bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors focus:ring-0 shadow-none">
                        <SelectValue placeholder="Prix" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                        {PRICE_FILTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
             </div>

             {/* Bouton Filtre Global */}
             <Button 
                variant="outline"
                className="rounded-full gap-2 transition-all h-12 px-6 border-transparent bg-white text-black hover:bg-white/90 hover:text-black font-semibold shadow-lg"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Filtres</span>
                {activeCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-black text-white border-0">
                    {activeCount}
                  </Badge>
                )}
              </Button>

              {activeCount > 0 && !isSticky && (
                <Button variant="ghost" size="icon" onClick={onReset} className="rounded-full h-12 w-12 text-white/60 hover:text-white hover:bg-white/10">
                  <X size={20} />
                </Button>
              )}
          </div>
        </div>
      </motion.div>

      {/* Mobile & Advanced Filters Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto">
          <SheetTitle className="text-3xl font-serif italic mb-8">Personnalisez votre recherche</SheetTitle>
          
          <div className="flex flex-col gap-10 pb-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Catégories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onCategoryChange(opt.value)}
                    className={cn(
                      "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      category === opt.value 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                        : "bg-muted/30 border-transparent text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  {DATE_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onDateRangeChange(opt.value)}
                      className={cn(
                        "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        dateRange === opt.value 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-muted/30 border-transparent text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Budget</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onPriceTypeChange(opt.value)}
                      className={cn(
                        "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        priceType === opt.value 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-muted/30 border-transparent text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 pt-6 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => { onReset(); setMobileFiltersOpen(false); }}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
            >
              Appliquer les filtres
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SKELETON CARDS
// ═══════════════════════════════════════════════
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-[2.5rem] border border-border/40 bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <div className="pt-6 border-t border-border/40 flex justify-between">
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  CATALOG PAGE — Main export
// ═══════════════════════════════════════════════
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const dateRange = searchParams.get('date') ?? 'all';
  const priceType = searchParams.get('price') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const debouncedSearch = useDebounce(search, 300);

  const activeFilterCount = [
    category !== 'all' ? 1 : 0,
    dateRange !== 'all' ? 1 : 0,
    priceType !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const { data, isLoading, isError, error, refetch } = useEvents({
    search: debouncedSearch,
    category: category as EventCategory | 'all',
    dateRange: dateRange as DateFilter,
    priceType: priceType as PriceFilter,
    page,
  });

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === 'all') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        if (key !== 'page') next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const setPage = useCallback(
    (p: number) => {
      updateParam('page', p === 1 ? '' : String(p));
    },
    [updateParam]
  );

  return (
    <div className="min-h-screen bg-black text-white dark selection:bg-white/20 selection:text-white">
      <title>EventNest — Collection Privée</title>
      
      <HeroBanner />

      <FilterBar
        search={search}
        onSearchChange={(v) => updateParam('q', v)}
        category={category}
        onCategoryChange={(v) => updateParam('category', v)}
        dateRange={dateRange}
        onDateRangeChange={(v) => updateParam('date', v)}
        priceType={priceType}
        onPriceTypeChange={(v) => updateParam('price', v)}
        activeCount={activeFilterCount}
        onReset={resetFilters}
      />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col mb-16 items-center text-center">
           <h2 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-white/90">
             {category === 'all' ? 'Toutes les expériences' : CATEGORY_LABELS[category as EventCategory]}
           </h2>
           {!isLoading && data && (
             <div className="mt-6 text-[11px] font-bold text-white/40 tracking-[0.4em] uppercase flex items-center gap-4">
                <div className="w-12 h-[1px] bg-white/20" />
                {data.totalEvents} Événements
                <div className="w-12 h-[1px] bg-white/20" />
             </div>
           )}
        </div>

        {isLoading && <SkeletonGrid />}

        {isError && <ErrorState error={error} onRetry={() => refetch()} />}

        {!isLoading && !isError && data && data.events.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="Aucun événement trouvé"
            description="Essayez d'élargir vos filtres ou de modifier votre recherche."
            actionLabel="Réinitialiser les filtres"
            onAction={resetFilters}
          />
        )}

        {!isLoading && !isError && data && data.events.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
            >
              <AnimatePresence mode="popLayout">
                {data.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination — Luxe Style */}
            {data.totalPages > 1 && (
              <div className="mt-32 flex justify-center">
                <Pagination>
                  <PaginationContent className="gap-4">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={cn(
                          "rounded-full h-14 w-14 p-0 border-border/40 hover:bg-primary hover:text-primary-foreground transition-all",
                          page <= 1 ? 'pointer-events-none opacity-20' : 'cursor-pointer'
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: data.totalPages }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                          className={cn(
                            "h-14 w-14 rounded-full border-border/40 font-black text-[10px] transition-all",
                            page === i + 1 
                              ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/40 scale-110" 
                              : "hover:bg-muted cursor-pointer"
                          )}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                        className={cn(
                          "rounded-full h-14 w-14 p-0 border-border/40 hover:bg-primary hover:text-primary-foreground transition-all",
                          page >= data.totalPages ? 'pointer-events-none opacity-20' : 'cursor-pointer'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}