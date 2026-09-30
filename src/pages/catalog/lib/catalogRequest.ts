import type { PopularProductQuery } from "@/features/product/api/productListApi";
import type { RecommendationFeedQuery } from "@/features/recommendation/types/recommendationFeed";
import type {
  CatalogFilterState,
  RankingRequestModel,
  RecommendationRequestModel,
  RecommendationSort,
} from "@/pages/catalog/types/catalog";

export const CATALOG_PAGE_LIMIT = 15;

export function toRankingRequestModel(
  filters: CatalogFilterState,
): RankingRequestModel {
  return { ...filters, mode: "ranking", sort: "POPULARITY" };
}

export function toRecommendationRequestModel(
  filters: CatalogFilterState,
  sort: RecommendationSort,
): RecommendationRequestModel {
  return { ...filters, mode: "recommendation", sort };
}

// GET /api/v1/items filters by publication date, so years become their first and last days.
export function toRankingQuery(
  request: RankingRequestModel,
  cursor?: string,
): PopularProductQuery {
  return {
    ...(request.categoryId === null ? {} : { categoryId: request.categoryId }),
    ...(cursor === undefined ? {} : { cursor }),
    ...(request.publicationYearFrom === null
      ? {}
      : { publishedFrom: `${request.publicationYearFrom}-01-01` }),
    ...(request.publicationYearTo === null
      ? {}
      : { publishedTo: `${request.publicationYearTo}-12-31` }),
    limit: CATALOG_PAGE_LIMIT,
  };
}

// categoryId is not sent: the feed accepts onboarding category labels, not /api/v1/categories ids.
export function toRecommendationQuery(
  request: RecommendationRequestModel,
  cursor?: string,
): RecommendationFeedQuery {
  return {
    cursor: cursor ?? null,
    matchScoreMin: request.matchScoreMin,
    pubYearFrom: request.publicationYearFrom,
    pubYearTo: request.publicationYearTo,
    size: CATALOG_PAGE_LIMIT,
    sort: request.sort,
    surface: "recommend_more",
  };
}
