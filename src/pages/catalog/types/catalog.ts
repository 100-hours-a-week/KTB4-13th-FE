export type CatalogMode = "ranking" | "recommendation";

export type RecommendationSort = "match" | "newest" | "price_asc";

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
