import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type { ProductDetail } from "@/features/product/types/product";

export type ProductDetailFetchResult =
  | { data: ProductDetail; ok: true }
  | { ok: false; reason: "not-found" | "unauthorized" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDescription(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

function parseProductDetail(data: unknown): ProductDetail | null {
  if (!isRecord(data)) {
    return null;
  }

  const description = parseDescription(data.description);

  if (
    description === undefined ||
    typeof data.productId !== "number" ||
    typeof data.itemName !== "string" ||
    (data.thumbnailUrl !== null && typeof data.thumbnailUrl !== "string") ||
    typeof data.author !== "string" ||
    typeof data.publisher !== "string" ||
    typeof data.publishedAt !== "string" ||
    typeof data.salePrice !== "number" ||
    typeof data.discountedPrice !== "number" ||
    typeof data.stockQuantity !== "number"
  ) {
    return null;
  }

  return {
    author: data.author,
    description,
    discountedPrice: data.discountedPrice,
    itemName: data.itemName,
    productId: data.productId,
    publishedAt: data.publishedAt,
    publisher: data.publisher,
    salePrice: data.salePrice,
    stockQuantity: data.stockQuantity,
    thumbnailUrl: data.thumbnailUrl,
  };
}

export async function fetchProductDetail(
  productId: number,
  signal?: AbortSignal,
): Promise<ProductDetailFetchResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/products/${productId}`, { signal }),
    );

    if (!result.ok) {
      if (result.status === 404) {
        return { ok: false, reason: "not-found" };
      }
      if (result.status === 401) {
        return { ok: false, reason: "unauthorized" };
      }
      return { ok: false, reason: "error" };
    }

    const data = parseProductDetail(result.data);
    return data?.productId === productId
      ? { data, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
