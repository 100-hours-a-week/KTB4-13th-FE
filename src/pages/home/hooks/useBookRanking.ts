import { useEffect, useState } from "react";

import { fetchPopularProducts } from "@/features/product/api/productListApi";
import type { ProductListItem } from "@/features/product/types/product";

// Backend default page size; the API defines no maximum limit.
const RANKING_LIMIT = 20;
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
    let isActive = true;

    void fetchPopularProducts(
      { limit: RANKING_LIMIT },
      { useDevCatalog: USE_DEV_CATALOG },
    ).then((page) => {
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
