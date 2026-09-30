export type RecommendationFeedSort = "match" | "newest" | "price_asc";

// Filters and sort are accepted only on recommend_more; the backend rejects them on home.
export type RecommendationFeedQuery =
  | { cursor: string | null; surface: "home" }
  | {
      cursor: string | null;
      matchScoreMin: number | null;
      pubYearFrom: number | null;
      pubYearTo: number | null;
      size: number;
      sort: RecommendationFeedSort;
      surface: "recommend_more";
    };

// Mirrors backend RecommendationFeedItemResponse; nullable fields follow the AI feed contract.
export interface RecommendationFeedItem {
  author: string | null;
  bookId: number;
  coverUrl: string | null;
  inStock: boolean;
  matchScore: number;
  price: number | null;
  title: string;
}

export interface RecommendationFeedPage {
  coldStart: boolean;
  items: RecommendationFeedItem[];
  nextCursor: string | null;
}
