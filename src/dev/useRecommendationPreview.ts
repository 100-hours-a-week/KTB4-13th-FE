import { useEffect, useState } from "react";

import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";

export function useRecommendationPreview(enabled: boolean) {
  const [books, setBooks] = useState<RecommendationFeedItem[]>([]);

  useEffect(() => {
    if (!enabled || !import.meta.env.DEV) return;

    let isActive = true;

    void import("@/dev/fixtures/recommendations").then(
      ({ createPreviewRecommendationBooks }) => {
        if (isActive) setBooks(createPreviewRecommendationBooks());
      },
    );

    return () => {
      isActive = false;
    };
  }, [enabled]);

  return books;
}
