export type SearchResultSort = "popular" | "newest" | "price_asc";

export interface SearchFilters {
  categoryId: number | null;
  priceMax: number | null;
  priceMin: number | null;
  pubYearFrom: number | null;
  pubYearTo: number | null;
}

export interface SearchRequestModel extends SearchFilters {
  cursor: string | null;
  query: string;
  size: 12;
  sort: SearchResultSort;
}

// Presentation model only. The Backend search response contract is pending in #162.
export interface SearchResultItem {
  author: string | null;
  discountedPrice: number | null;
  itemName: string;
  productId: number;
  salePrice: number;
  thumbnailUrl: string | null;
}

export type SearchResultState =
  | { kind: "idle" }
  | { kind: "unavailable" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "empty" }
  | {
      items: SearchResultItem[];
      kind: "ready";
      nextCursor: string | null;
      paginationStatus: "idle" | "loadingMore" | "error";
    };
