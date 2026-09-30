import { useEffect, useState } from "react";

import { fetchRecommendationFeed } from "@/features/recommendation/api/recommendationFeedApi";
import type { RecommendationFeedItem } from "@/features/recommendation/types/recommendationFeed";

type HomeRecommendationsState =
  | { kind: "loading" }
  | { items: RecommendationFeedItem[]; kind: "ready" }
  | { kind: "error" };

// Callers mount this only for authenticated users because the feed requires a token.
export function useHomeRecommendations() {
  const [state, setState] = useState<HomeRecommendationsState>({
    kind: "loading",
  });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchRecommendationFeed(
      { cursor: null, surface: "home" },
      controller.signal,
    ).then((result) => {
      if (!controller.signal.aborted) {
        setState(
          result.ok
            ? { items: result.data.items, kind: "ready" }
            : { kind: "error" },
        );
      }
    });

    return () => controller.abort();
  }, [requestKey]);

  const retry = () => {
    setState({ kind: "loading" });
    setRequestKey((current) => current + 1);
  };

  return { recommendations: state, retry };
}
