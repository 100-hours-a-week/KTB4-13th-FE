import { useCallback, useEffect, useRef, useState } from "react";

import { fetchMyProductReview } from "@/features/review/api/reviewApi";
import type { ProductReview } from "@/features/review/types/review";

export type MyProductReviewState =
  | { kind: "loading" }
  | { kind: "found"; review: ProductReview }
  | { kind: "none" };

// A failed lookup counts as "none": BE still rejects a duplicate review, so writing stays possible.
export function useMyProductReviews(productIds: number[]) {
  const key = [...new Set(productIds)].sort((a, b) => a - b).join(",");
  const [settled, setSettled] = useState<ReadonlyMap<number, ProductReview | null>>(() => new Map());
  const requestedRef = useRef(new Set<number>());
  const settledRef = useRef(new Set<number>());

  useEffect(() => {
    const controller = new AbortController();
    const requested = requestedRef.current;
    const settledIds = settledRef.current;
    const started: number[] = [];
    const ids = key === "" ? [] : key.split(",").map(Number);
    for (const productId of ids) {
      if (requested.has(productId)) continue;
      requested.add(productId);
      started.push(productId);
      void fetchMyProductReview(productId, controller.signal).then((result) => {
        if (controller.signal.aborted) return;
        settledIds.add(productId);
        setSettled((previous) => new Map(previous).set(productId, result.ok ? result.review : null));
      });
    }
    // Requests cut off here are dropped so the next run asks again.
    return () => {
      controller.abort();
      for (const productId of started) {
        if (!settledIds.has(productId)) requested.delete(productId);
      }
    };
  }, [key]);

  return useCallback((productId: number): MyProductReviewState => {
    if (!settled.has(productId)) return { kind: "loading" };
    const review = settled.get(productId) ?? null;
    return review ? { kind: "found", review } : { kind: "none" };
  }, [settled]);
}
