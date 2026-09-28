import { useEffect, useState } from "react";

import { fetchPopularProducts } from "@/features/product/api/productListApi";
import type { ProductListItem } from "@/features/product/types/product";

// Backend default page size; the API defines no maximum limit.
const RANKING_LIMIT = 20;

type BookRankingState =
  | { kind: "loading" }
  | { kind: "ready"; items: ProductListItem[] }
  | { kind: "error" };

// Callers mount this only for authenticated users because GET /api/v1/items requires a token.
export function useBookRanking() {
  const [state, setState] = useState<BookRankingState>({ kind: "loading" });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    void fetchPopularProducts(RANKING_LIMIT).then((page) => {
      if (isActive) {
        setState(page ? { kind: "ready", items: page.items } : { kind: "error" });
      }
    });

    return () => {
      isActive = false;
    };
  }, [requestKey]);

  const retry = () => {
    setState({ kind: "loading" });
    setRequestKey((current) => current + 1);
  };

  return { ranking: state, retry };
}
