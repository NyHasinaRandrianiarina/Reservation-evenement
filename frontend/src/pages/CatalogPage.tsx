import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  CalendarX,
  SlidersHorizontal,
  X,
  Sparkles,
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
} from '@/lib/constants';
import type {
  EventCategory,
  DateFilter,
  PriceFilter,
} from '@/types/event';

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
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/10 py-16 sm:py-20 px-6">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Sparkles size={14} />
            Découvrez les événements à venir
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
            Trouvez votre prochain{' '}
            <span className="text-primary">événement</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conférences, concerts, formations, sport… Parcourez des centaines d'événements
            et inscrivez-vous en quelques clics.
          </p>
        </motion.div>
      </div>
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

  const selectFilters = (
    <>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          {DATE_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priceType} onValueChange={onPriceTypeChange}>
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="Prix" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un événement…"
              className="pl-9"
            />
          </div>

          {selectFilters}

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={14} className="mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9"
            />
          </div>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <SlidersHorizontal size={14} />
                Filtres
                {activeCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetTitle className="text-lg font-semibold mb-4">Filtres</SheetTitle>
              <div className="flex flex-col gap-4 pb-4">
                {selectFilters}
              </div>
              <SheetFooter className="flex gap-2">
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onReset();
                      setMobileFiltersOpen(false);
                    }}
                    className="flex-1"
                  >
                    Réinitialiser
                  </Button>
                )}
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1"
                >
                  Appliquer
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SKELETON CARDS
// ═══════════════════════════════════════════════
function SkeletonEventCard() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3.5 w-2/5" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonEventCard key={i} />
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
    <>
      <title>EventNest — Découvrez les meilleurs événements</title>
      <meta
        name="description"
        content="Trouvez et inscrivez-vous aux meilleurs événements : conférences, concerts, formations, sport et plus encore."
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

      <section className="max-w-7xl mx-auto px-6 py-10">
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data.events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {Array.from({ length: data.totalPages }).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                        className={
                          page >= data.totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
