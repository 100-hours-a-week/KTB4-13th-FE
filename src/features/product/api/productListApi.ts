import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchPublic } from "@/common/api/httpClient";
import type {
  ProductListItem,
  ProductListPage,
} from "@/features/product/types/product";

export interface PopularProductQuery {
  categoryId?: number;
  cursor?: string;
  limit: number;
  publishedFrom?: string;
  publishedTo?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductListItem(value: unknown): value is ProductListItem {
  return (
    isRecord(value) &&
    typeof value.author === "string" &&
    (value.discountedPrice === null ||
      typeof value.discountedPrice === "number") &&
    typeof value.itemId === "number" &&
    typeof value.itemName === "string" &&
    typeof value.salePrice === "number" &&
    (value.thumbnailUrl === null || typeof value.thumbnailUrl === "string")
  );
}

function isProductListPage(data: unknown): data is ProductListPage {
  return (
    isRecord(data) &&
    Array.isArray(data.items) &&
    data.items.every(isProductListItem) &&
    (data.nextCursor === null || typeof data.nextCursor === "string")
  );
}

export async function fetchPopularProducts(
  query: PopularProductQuery,
): Promise<ProductListPage | null> {
  const searchParams = new URLSearchParams({
    sort: "POPULARITY",
    limit: String(query.limit),
  });

  if (query.categoryId !== undefined) {
    searchParams.set("categoryId", String(query.categoryId));
  }

  if (query.cursor !== undefined) {
    searchParams.set("cursor", query.cursor);
  }

  if (query.publishedFrom !== undefined) {
    searchParams.set("publishedFrom", query.publishedFrom);
  }

  if (query.publishedTo !== undefined) {
    searchParams.set("publishedTo", query.publishedTo);
  }

  try {
    const result = await parseApiResponse(
      await fetchPublic(`/api/v1/items?${searchParams.toString()}`),
    );

    return result.ok && isProductListPage(result.data) ? result.data : null;
  } catch {
    return null;
  }
}
