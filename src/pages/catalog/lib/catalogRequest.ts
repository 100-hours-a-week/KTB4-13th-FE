import type { PopularProductQuery } from "@/features/product/api/productListApi";
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
