import { useEffect, useState } from "react";

import { fetchPopularProducts } from "@/features/product/api/productListApi";
import type { ProductListItem } from "@/features/product/types/product";
import { fetchProductReviewCount, fetchProductReviews } from "@/features/review/api/reviewApi";

// Backend default page size; the API defines no maximum limit.
const RANKING_LIMIT = 20;
const REVIEW_COUNT_CONCURRENCY = 4;
const REVIEW_SUMMARY_LIMIT = 20;
// Dev-only opt-in to show real dev catalog books while the local DB has none.
const USE_DEV_CATALOG =
  import.meta.env.DEV && import.meta.env.VITE_DEV_HOME_RANKING_SOURCE === "dev-api";

export type BookRankingState =
  | { kind: "loading" }
  | { kind: "ready"; items: ProductListItem[] }
  | { kind: "error" };

export function useBookRanking() {
  const [state, setState] = useState<BookRankingState>({ kind: "loading" });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchPopularProducts(
      { limit: RANKING_LIMIT },
      { useDevCatalog: USE_DEV_CATALOG },
    ).then(async (page) => {
      if (controller.signal.aborted) return;
      if (!page) {
        setState({ kind: "error" });
        return;
      }

      setState({ kind: "ready", items: page.items });
      const missingCounts = page.items.filter(
        (item) => item.reviewCount === undefined || item.reviewCount === 0,
      );
      let nextIndex = 0;

      // The ranking snapshot can lag behind reviews. Verify only missing counts
      // against the existing public API, limiting concurrent requests.
      await Promise.all(
        Array.from({ length: Math.min(REVIEW_COUNT_CONCURRENCY, missingCounts.length) }, async () => {
          while (!controller.signal.aborted && nextIndex < missingCounts.length) {
            const item = missingCounts[nextIndex++];
            const result = await fetchProductReviewCount(item.itemId, controller.signal);
            if (!result.ok || controller.signal.aborted) continue;
            // Only calculate an average when the fetched page contains every
            // review; a partial page would produce a misleading rating.
            const reviews = result.count > 0 && result.count <= REVIEW_SUMMARY_LIMIT
              ? await fetchProductReviews(item.itemId, 0, result.count, controller.signal, true)
              : null;
            if (controller.signal.aborted) continue;
            const completeReviews = reviews?.ok && !reviews.data.hasNext &&
              reviews.data.reviews.length === result.count
              ? reviews.data.reviews
              : null;
            const average = completeReviews
              ? completeReviews.reduce((sum, review) => sum + review.rate, 0) / completeReviews.length
              : null;
            setState((current) =>
              current.kind === "ready"
                ? {
                    kind: "ready",
                    items: current.items.map((book) =>
                      book.itemId === item.itemId
                        ? {
                            ...book,
                            reviewCount: result.count,
                            ...(average !== null ? { reviewRate: average } : {}),
                          }
                        : book,
                    ),
                  }
                : current,
            );
          }
        }),
      );
    });

    return () => controller.abort();
  }, [requestKey]);

  const retry = () => {
    setState({ kind: "loading" });
    setRequestKey((current) => current + 1);
  };

  return { ranking: state, retry };
}
