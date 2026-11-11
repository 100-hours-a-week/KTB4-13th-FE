import type { InterestCategory } from "@/features/onboarding/lib/interestCategories";
import type { RecommendationFeedSort } from "@/features/recommendation/types/recommendationFeed";

export type CatalogMode = "ranking" | "recommendation";

export type RecommendationSort = RecommendationFeedSort;

// Ranking rows come from products and recommendation rows from books, so ids stay source-specific.
export interface CatalogBookItem {
  author: string | null;
  key: string;
  // Recommendation rows only; ranking rows have no taste score.
  matchScore: number | null;
  originalPrice: number | null;
  price: number | null;
  productId: number | null;
  // Ranking rows only, and only when the book has rated reviews.
  review: { count: number; rate: number } | null;
  thumbnailUrl: string | null;
  title: string;
}

export interface CatalogFilterState {
  // Ranking filters by /api/v1/categories id; the recommendation feed by onboarding interest label.
  categoryId: number | null;
  interestCategory: InterestCategory | null;
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
