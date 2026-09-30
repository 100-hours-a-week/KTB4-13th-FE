export type BookSearchSort = "popular" | "newest" | "price_asc";

export interface BookSearchQuery {
  cursor: string | null;
  priceMax: number | null;
  priceMin: number | null;
  pubYearFrom: number | null;
  pubYearTo: number | null;
  query: string;
  size: number;
  sort: BookSearchSort;
}

// Mirrors backend BookSearchItemResponse; nullable fields follow the AI /search contract.
export interface BookSearchItem {
  author: string | null;
  bookId: number;
  coverUrl: string | null;
  inStock: boolean;
  price: number | null;
  publisher: string | null;
  title: string;
}

// Mirrors backend BookSearchResponse. The contract has no total count.
export interface BookSearchPage {
  fallbackMessage: string | null;
  items: BookSearchItem[];
  nextCursor: string | null;
}
