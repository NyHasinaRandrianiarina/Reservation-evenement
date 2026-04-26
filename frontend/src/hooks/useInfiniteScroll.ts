import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Called when the sentinel element becomes visible */
  onLoadMore: () => void;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a load is currently in progress */
  isLoading: boolean;
  /** IntersectionObserver rootMargin (default: "200px") */
  rootMargin?: string;
}

/**
 * Hook that triggers `onLoadMore` when a sentinel element scrolls into view.
 * Returns a ref to attach to the sentinel element at the bottom of the list.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const stableOnLoadMore = useCallback(() => {
    onLoadMore();
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          stableOnLoadMore();
        }
      },
      { rootMargin }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, rootMargin, stableOnLoadMore]);

  return sentinelRef;
}
