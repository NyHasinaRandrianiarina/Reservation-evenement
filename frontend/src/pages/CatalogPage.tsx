import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CalendarX,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
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
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-background py-20 px-6">
      {/* Abstract Premium Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:invert" />
      </div>

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
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic font-medium text-foreground tracking-tighter leading-[1.1] mb-8">
            Vivez des moments <br />
            <span className="text-primary font-sans not-italic font-black uppercase tracking-tighter">
              D'exception
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Une sélection exclusive des événements les plus prestigieux. 
            De la culture au sport, accédez à l'inaccessible.
          </p>
        </motion.div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Explorez</span>
        <div className="w-px h-12 bg-linear-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════
//  FILTER BAR
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CategoryPills = () => (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
      {CATEGORY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onCategoryChange(opt.value)}
          className={cn(
            "whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer",
            category === opt.value
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
              : "bg-background text-muted-foreground border-border/40 hover:border-primary/50 hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={cn(
      "sticky top-20 z-30 transition-all duration-500 px-6",
      isScrolled ? "py-4" : "py-8"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto rounded-[2.5rem] transition-all duration-500",
        isScrolled 
          ? "bg-background/80 backdrop-blur-2xl border border-border/40 shadow-2xl p-3" 
          : "bg-transparent p-0"
      )}>
        <div className="flex flex-col gap-6">
          {/* Top Row: Search and Category Pills */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une expérience…"
                className="pl-12 h-12 rounded-full border-border/40 bg-background/50 focus:bg-background transition-all"
              />
            </div>
            
            <div className="flex-1 w-full overflow-hidden">
               <CategoryPills />
            </div>

            <div className="hidden md:flex items-center gap-3">
               <Select value={dateRange} onValueChange={onDateRangeChange}>
                <SelectTrigger className="w-40 h-12 rounded-full border-border/40 bg-background/50">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {DATE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceType} onValueChange={onPriceTypeChange}>
                <SelectTrigger className="w-36 h-12 rounded-full border-border/40 bg-background/50">
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {PRICE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X size={18} />
                </Button>
              )}
            </div>

            {/* Mobile Filter Trigger */}
            <div className="md:hidden w-full flex gap-2">
               <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-full border-border/40 gap-2"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filtres Avancés
                {activeCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="bottom" className="rounded-t-[3rem] p-8">
            <SheetTitle className="text-2xl font-serif italic mb-8">Personnalisez votre recherche</SheetTitle>
            
            <div className="flex flex-col gap-8 pb-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  {DATE_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onDateRangeChange(opt.value)}
                      className={cn(
                        "py-3 rounded-2xl text-xs font-bold transition-all border",
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
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Budget</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onPriceTypeChange(opt.value)}
                      className={cn(
                        "py-3 rounded-2xl text-xs font-bold transition-all border",
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

            <SheetFooter className="flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => { onReset(); setMobileFiltersOpen(false); }}
                className="flex-1 h-14 rounded-2xl font-bold"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-[2] h-14 rounded-2xl font-bold shadow-lg shadow-primary/20"
              >
                Voir les résultats
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SKELETON CARDS
// ═══════════════════════════════════════════════
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-[2rem] border border-border/40 bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <div className="pt-4 border-t border-border/40 flex justify-between">
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

  // Read filters from URL
  const search = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const dateRange = searchParams.get('date') ?? 'all';
  const priceType = searchParams.get('price') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const debouncedSearch = useDebounce(search, 300);

  // Count active filters (excluding search & page)
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

  // Update URL params
  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === 'all') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        // Reset page when filters change
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
    <div className="min-h-screen bg-background pb-20">
      <title>EventNest — L'excellence événementielle</title>
      <meta
        name="description"
        content="Découvrez une sélection exclusive des meilleurs événements : conférences, concerts, formations et plus encore."
      />

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

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
           <h2 className="text-2xl font-serif italic font-medium">
             {category === 'all' ? 'Toutes les expériences' : CATEGORY_LABELS[category as EventCategory]}
             {!isLoading && data && <span className="ml-4 text-xs font-sans not-italic font-black text-muted-foreground/40 tracking-[0.2em] uppercase">({data.total} résultats)</span>}
           </h2>
        </div>

        {/* Loading */}
        {isLoading && <SkeletonGrid />}

        {/* Error */}
        {isError && <ErrorState error={error} onRetry={() => refetch()} />}

        {/* Empty */}
        {!isLoading && !isError && data && data.events.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="Aucun événement trouvé"
            description="Essayez d'élargir vos filtres ou de modifier votre recherche."
            actionLabel="Réinitialiser les filtres"
            onAction={resetFilters}
          />
        )}

        {/* Data */}
        {!isLoading && !isError && data && data.events.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
            >
              <AnimatePresence mode="popLayout">
                {data.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-20 flex justify-center">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={cn(
                          "rounded-full h-12 w-12 p-0 flex items-center justify-center border-border/40 hover:bg-primary hover:text-primary-foreground transition-all",
                          page <= 1 ? 'pointer-events-none opacity-30' : 'cursor-pointer'
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: data.totalPages }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                          className={cn(
                            "h-12 w-12 rounded-full border-border/40 font-bold transition-all",
                            page === i + 1 
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
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
                          "rounded-full h-12 w-12 p-0 flex items-center justify-center border-border/40 hover:bg-primary hover:text-primary-foreground transition-all",
                          page >= data.totalPages ? 'pointer-events-none opacity-30' : 'cursor-pointer'
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