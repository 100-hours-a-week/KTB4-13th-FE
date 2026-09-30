import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPopularProducts } from "@/features/product/api/productListApi";
import { fetchRecommendationFeed } from "@/features/recommendation/api/recommendationFeedApi";
import {
  toRankingBookItem,
  toRecommendationBookItem,
} from "@/pages/catalog/lib/catalogBookItem";
import {
  toRankingQuery,
  toRecommendationQuery,
} from "@/pages/catalog/lib/catalogRequest";
import type {
  CatalogBookItem,
  CatalogRequestModel,
} from "@/pages/catalog/types/catalog";

export type CatalogListStatus = "loading" | "ready" | "error" | "loadingMore";

interface CatalogBooksState {
  hasLoadMoreError: boolean;
  items: CatalogBookItem[];
  nextCursor: string | null;
  requestId: string;
  status: CatalogListStatus;
}

type CatalogPageResult =
  | { items: CatalogBookItem[]; nextCursor: string | null; ok: true }
  | { ok: false; reason: "cursor-expired" | "error" };

const INITIAL_STATE: CatalogBooksState = {
  hasLoadMoreError: false,
  items: [],
  nextCursor: null,
  requestId: "",
  status: "loading",
};

async function fetchCatalogPage(
  request: CatalogRequestModel,
  cursor?: string,
): Promise<CatalogPageResult> {
  if (request.mode === "ranking") {
    const page = await fetchPopularProducts(toRankingQuery(request, cursor));

    return page
      ? {
          items: page.items.map(toRankingBookItem),
          nextCursor: page.nextCursor,
          ok: true,
        }
      : { ok: false, reason: "error" };
  }

  const result = await fetchRecommendationFeed(
    toRecommendationQuery(request, cursor),
  );

  return result.ok
    ? {
        items: result.data.items.map(toRecommendationBookItem),
        nextCursor: result.data.nextCursor,
        ok: true,
      }
    : result;
}

export function useCatalogBooks(request: CatalogRequestModel) {
  const [state, setState] = useState<CatalogBooksState>(INITIAL_STATE);
  const [requestKey, setRequestKey] = useState(0);
  const requestVersionRef = useRef(0);

  const {
    categoryId,
    matchScoreMin,
    mode,
    publicationYearFrom,
    publicationYearTo,
    sort,
  } = request;
  const requestId = [
    mode,
    categoryId ?? "all",
    publicationYearFrom ?? "all",
    publicationYearTo ?? "all",
    matchScoreMin ?? "all",
    sort,
    requestKey,
  ].join(":");

  useEffect(() => {
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;

    void fetchCatalogPage(request).then((page) => {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setState(
        page.ok
          ? {
              hasLoadMoreError: false,
              items: page.items,
              nextCursor: page.nextCursor,
              requestId,
              status: "ready",
            }
          : { ...INITIAL_STATE, requestId, status: "error" },
      );
    });
  }, [
    categoryId,
    matchScoreMin,
    mode,
    publicationYearFrom,
    publicationYearTo,
    request,
    requestId,
    sort,
  ]);

  const visibleState = state.requestId === requestId ? state : INITIAL_STATE;

  const loadMore = useCallback(() => {
    if (
      visibleState.nextCursor === null ||
      visibleState.status === "loadingMore"
    ) {
      return;
    }

    const requestVersion = requestVersionRef.current;
    const currentCursor = visibleState.nextCursor;

    setState((current) => ({
      ...current,
      hasLoadMoreError: false,
      status: "loadingMore",
    }));

    void fetchCatalogPage(request, currentCursor).then((page) => {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      // An expired recommendation cursor cannot be resumed, so the list restarts from the first page.
      if (!page.ok && page.reason === "cursor-expired") {
        setRequestKey((current) => current + 1);
        return;
      }

      setState((current) =>
        page.ok
          ? {
              hasLoadMoreError: false,
              items: [...current.items, ...page.items],
              nextCursor:
                page.nextCursor === currentCursor ? null : page.nextCursor,
              requestId,
              status: "ready",
            }
          : {
              ...current,
              hasLoadMoreError: true,
              status: "ready",
            },
      );
    });
  }, [request, requestId, visibleState.nextCursor, visibleState.status]);

  const retry = () => {
    setRequestKey((current) => current + 1);
  };

  return { ...visibleState, loadMore, retry };
}
