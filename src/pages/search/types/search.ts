import type {
  BookSearchItem,
  BookSearchSort,
} from "@/features/search/types/bookSearch";

export interface SearchFilters {
  priceMax: number | null;
  priceMin: number | null;
  pubYearFrom: number | null;
  pubYearTo: number | null;
}

export interface SearchRequestModel extends SearchFilters {
  query: string;
  sort: BookSearchSort;
}

export type SearchResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { fallbackMessage: string | null; kind: "empty" }
  | {
      items: BookSearchItem[];
      kind: "ready";
      nextCursor: string | null;
      paginationStatus: "idle" | "loadingMore" | "error";
    };
