import type { RecommendationFeedSort } from "@/features/recommendation/types/recommendationFeed";

export type CatalogMode = "ranking" | "recommendation";

export type RecommendationSort = RecommendationFeedSort;

// Ranking rows come from products and recommendation rows from books, so ids stay source-specific.
export interface CatalogBookItem {
  author: string | null;
  key: string;
  originalPrice: number | null;
  price: number | null;
  thumbnailUrl: string | null;
  title: string;
}

export interface CatalogFilterState {
  categoryId: number | null;
  matchScoreMin: number | null;
  publicationYearFrom: number | null;
  publicationYearTo: number | null;
}

export interface RankingRequestModel extends CatalogFilterState {
  mode: "ranking";
  sort: "POPULARITY";
}

export interface RecommendationRequestModel extends CatalogFilterState {
  mode: "recommendation";
  sort: RecommendationSort;
}

export type CatalogRequestModel =
  | RankingRequestModel
  | RecommendationRequestModel;
