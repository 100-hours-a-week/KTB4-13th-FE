import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  ProductListItem,
  ProductListPage,
} from "@/features/product/types/product";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductListItem(value: unknown): value is ProductListItem {
  return (
    isRecord(value) &&
    typeof value.itemId === "number" &&
    typeof value.itemName === "string" &&
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

// GET /api/v1/items requires authentication under the current backend security config.
export async function fetchPopularProducts(
  limit: number,
): Promise<ProductListPage | null> {
  const query = new URLSearchParams({
    sort: "POPULARITY",
    limit: String(limit),
  });

  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/items?${query.toString()}`),
    );

    return result.ok && isProductListPage(result.data) ? result.data : null;
  } catch {
    return null;
  }
}
