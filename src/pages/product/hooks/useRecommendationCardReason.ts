import { useEffect, useState } from "react";

import { fetchRecommendationCardDetail } from "@/features/recommendation/api/recommendationCardApi";

interface StoredRecommendationReason {
  reasonLong: string | null;
  recommendationCardId: number;
}

export function useRecommendationCardReason(
  recommendationCardId: number | null,
) {
  const [stored, setStored] = useState<StoredRecommendationReason | null>(null);

  useEffect(() => {
    if (recommendationCardId === null) {
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    void fetchRecommendationCardDetail(
      recommendationCardId,
      controller.signal,
    ).then((result) => {
      if (!isActive) {
        return;
      }

      setStored({
        reasonLong: result.ok ? result.data.reasonLong : null,
        recommendationCardId,
      });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [recommendationCardId]);

  return stored?.recommendationCardId === recommendationCardId
    ? stored.reasonLong
    : null;
}
