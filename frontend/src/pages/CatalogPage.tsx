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
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background py-20 px-6">
      <BackgroundRippleEffect />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles size={12} className="animate-pulse" />
            L'excellence événementielle
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif italic font-medium text-foreground tracking-tighter leading-[1.1] mb-8">
            Vivez des moments <br />
            <span className="text-primary font-sans not-italic font-black uppercase tracking-tighter">
              D'exception
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Une sélection exclusive des événements les plus prestigieux. 
            Accédez à l'inaccessible.
          </p>
        </motion.div>
      </div>
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
      "z-40 transition-all duration-500 w-full",
      isSticky ? "fixed top-0 left-0 px-4 py-3" : "relative px-6 py-8"
    )}>
      <motion.div 
        layout
        className={cn(
          "max-w-7xl mx-auto transition-all duration-500",
          isSticky 
            ? "bg-background/80 backdrop-blur-2xl border border-border/40 shadow-2xl rounded-full p-2 pl-6" 
            : "bg-transparent p-0"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Search — Toujours visible mais plus compacte en sticky */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isSticky ? "Rechercher..." : "Rechercher une expérience…"}
              className={cn(
                "pl-12 rounded-full border-border/40 bg-background/50 focus:bg-background transition-all h-10 lg:h-12",
                isSticky && "h-10 border-transparent bg-transparent focus:bg-transparent"
              )}
            />
          </div>
          
          {/* Desktop Filters — On cache les Pills en mode Sticky pour gagner de la place, sauf si on a de la largeur */}
          {!isSticky && (
            <div className="hidden lg:block flex-1 overflow-hidden">
               <CategoryPills />
            </div>
          )}

          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2">
                {/* Selects seulement si pas sticky ou sur grand écran */}
                {!isSticky && (
                  <>
                    <Select value={dateRange} onValueChange={onDateRangeChange}>
                      <SelectTrigger className="w-36 h-12 rounded-full border-border/40 bg-background/50">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_FILTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={priceType} onValueChange={onPriceTypeChange}>
                      <SelectTrigger className="w-32 h-12 rounded-full border-border/40 bg-background/50">
                        <SelectValue placeholder="Prix" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_FILTER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
             </div>

             {/* Bouton Filtre Global (toujours présent en sticky pour l'UX) */}
             <Button 
                variant={isSticky ? "primary" : "outline"}
                className={cn(
                  "rounded-full gap-2 transition-all",
                  isSticky ? "h-10 px-6 shadow-lg" : "h-12 px-6"
                )}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Filtres</span>
                {activeCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-background text-foreground border-0">
                    {activeCount}
                  </Badge>
                )}
              </Button>

              {activeCount > 0 && !isSticky && (
                <Button variant="ghost" size="icon" onClick={onReset} className="rounded-full">
                  <X size={18} />
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
    <div className="min-h-screen bg-background">
      <title>EventNest — L'excellence événementielle</title>
      
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

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col mb-16">
           <h2 className="text-4xl font-serif italic font-medium tracking-tight">
             {category === 'all' ? 'Toutes les expériences' : CATEGORY_LABELS[category as EventCategory]}
           </h2>
           {!isLoading && data && (
             <div className="mt-2 text-[10px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">
                Collection Exclusive — {data.totalEvents} Résultats
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