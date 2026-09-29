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

// Publication years stay in RankingRequestModel until BE #154 defines its query names.
export function toRankingQuery(
  request: RankingRequestModel,
  cursor?: string,
): PopularProductQuery {
  return {
    ...(request.categoryId === null ? {} : { categoryId: request.categoryId }),
    ...(cursor === undefined ? {} : { cursor }),
    limit: CATALOG_PAGE_LIMIT,
  };
}
