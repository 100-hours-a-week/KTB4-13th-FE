import { useCallback, useEffect, useRef, useState } from "react";

import { fetchBookSearchResults } from "@/features/search/api/bookSearchApi";
import type { BookSearchResult } from "@/features/search/api/bookSearchApi";
import type {
  SearchRequestModel,
  SearchResultState,
} from "@/pages/search/types/search";

const SEARCH_RESULT_SIZE = 12;

interface StoredSearchResultState {
  requestId: string;
  state: SearchResultState;
}

function toFirstPageState(result: BookSearchResult): SearchResultState {
  if (!result.ok) {
    return { kind: "error" };
  }

  if (result.data.items.length === 0) {
    return { fallbackMessage: result.data.fallbackMessage, kind: "empty" };
  }

  return {
    items: result.data.items,
    kind: "ready",
    nextCursor: result.data.nextCursor,
    paginationStatus: "idle",
  };
}

export function useSearchResults(request: SearchRequestModel) {
  const [retryCount, setRetryCount] = useState(0);
  const [stored, setStored] = useState<StoredSearchResultState>({
    requestId: "",
    state: { kind: "loading" },
  });
  const requestVersionRef = useRef(0);
  const { priceMax, priceMin, pubYearFrom, pubYearTo, query, sort } = request;
  // Any change to the query, filters, or sort starts again from the first page without a cursor.
  const requestId = JSON.stringify([
    query,
    sort,
    priceMin,
    priceMax,
    pubYearFrom,
    pubYearTo,
    retryCount,
  ]);

  useEffect(() => {
    if (!query) {
      return undefined;
    }

    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;
    const controller = new AbortController();

    void fetchBookSearchResults(
      {
        cursor: null,
        priceMax,
        priceMin,
        pubYearFrom,
        pubYearTo,
        query,
        size: SEARCH_RESULT_SIZE,
        sort,
      },
      controller.signal,
    ).then((result) => {
      if (requestVersionRef.current === requestVersion) {
        setStored({ requestId, state: toFirstPageState(result) });
      }
    });

    return () => controller.abort();
  }, [priceMax, priceMin, pubYearFrom, pubYearTo, query, requestId, sort]);

  let state: SearchResultState;

  if (!query) {
    state = { kind: "idle" };
  } else if (stored.requestId !== requestId) {
    state = { kind: "loading" };
  } else {
    state = stored.state;
  }

  const nextCursor = state.kind === "ready" ? state.nextCursor : null;
  const paginationStatus =
    state.kind === "ready" ? state.paginationStatus : null;

  const loadMore = useCallback(() => {
    if (nextCursor === null || paginationStatus === "loadingMore") {
      return;
    }

    const requestVersion = requestVersionRef.current;

    setStored((current) =>
      current.state.kind === "ready"
        ? {
            ...current,
            state: { ...current.state, paginationStatus: "loadingMore" },
          }
        : current,
    );

    void fetchBookSearchResults({
      cursor: nextCursor,
      priceMax,
      priceMin,
      pubYearFrom,
      pubYearTo,
      query,
      size: SEARCH_RESULT_SIZE,
      sort,
    }).then((result) => {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      // An expired cursor cannot be resumed, so the search restarts from the first page.
      if (!result.ok && result.reason === "cursor-expired") {
        setRetryCount((current) => current + 1);
        return;
      }

      setStored((current) => {
        if (current.state.kind !== "ready") {
          return current;
        }

        return {
          ...current,
          state: result.ok
            ? {
                items: [...current.state.items, ...result.data.items],
                kind: "ready",
                nextCursor: result.data.nextCursor,
                paginationStatus: "idle",
              }
            : { ...current.state, paginationStatus: "error" },
        };
      });
    });
  }, [
    nextCursor,
    paginationStatus,
    priceMax,
    priceMin,
    pubYearFrom,
    pubYearTo,
    query,
    sort,
  ]);

  const retry = () => setRetryCount((current) => current + 1);

  return { loadMore, retry, state };
}
