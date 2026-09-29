import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPopularProducts } from "@/features/product/api/productListApi";
import type { ProductListItem } from "@/features/product/types/product";
import { toRankingQuery } from "@/pages/catalog/lib/catalogRequest";
import type { CatalogRequestModel } from "@/pages/catalog/types/catalog";

export type CatalogListStatus = "loading" | "ready" | "error" | "loadingMore";

interface CatalogBooksState {
  hasLoadMoreError: boolean;
  items: ProductListItem[];
  nextCursor: string | null;
  requestId: string;
  status: CatalogListStatus;
}

const INITIAL_STATE: CatalogBooksState = {
  hasLoadMoreError: false,
  items: [],
  nextCursor: null,
  requestId: "",
  status: "loading",
};

const RECOMMENDATION_EMPTY_STATE: CatalogBooksState = {
  hasLoadMoreError: false,
  items: [],
  nextCursor: null,
  requestId: "recommendation",
  status: "ready",
};

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

    if (request.mode === "recommendation") {
      // BE #155 has not defined recommend_more yet. Keep this as a deliberate empty state.
      return;
    }

    void fetchPopularProducts(toRankingQuery(request)).then((page) => {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setState(
        page
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

  const visibleState =
    mode === "recommendation"
      ? RECOMMENDATION_EMPTY_STATE
      : state.requestId === requestId
        ? state
        : INITIAL_STATE;

  const loadMore = useCallback(() => {
    if (
      request.mode !== "ranking" ||
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

    void fetchPopularProducts(toRankingQuery(request, currentCursor)).then(
      (page) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setState((current) =>
          page
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
      },
    );
  }, [request, requestId, visibleState.nextCursor, visibleState.status]);

  const retry = () => {
    setRequestKey((current) => current + 1);
  };

  return { ...visibleState, loadMore, retry };
}
