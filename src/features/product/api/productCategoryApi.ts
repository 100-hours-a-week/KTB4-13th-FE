import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type { ProductCategory } from "@/features/product/types/product";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.path === "string"
  );
}

function isProductCategoryList(
  value: unknown,
): value is { categories: ProductCategory[] } {
  return (
    isRecord(value) &&
    Array.isArray(value.categories) &&
    value.categories.every(isProductCategory)
  );
}

export async function fetchProductCategories(): Promise<ProductCategory[] | null> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/categories"),
    );

    return result.ok && isProductCategoryList(result.data)
      ? result.data.categories
      : null;
  } catch {
    return null;
  }
}
