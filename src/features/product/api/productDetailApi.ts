import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchPublic } from "@/common/api/httpClient";
import type { ProductDetail } from "@/features/product/types/product";

export type ProductDetailFetchResult =
  | { data: ProductDetail; ok: true }
  | { ok: false; reason: "not-found" | "error" };

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
    typeof data.category !== "string" ||
    typeof data.salePrice !== "number" ||
    typeof data.discountedPrice !== "number" ||
    typeof data.reviewCount !== "number" ||
    typeof data.reviewRate !== "number" ||
    typeof data.stockQuantity !== "number"
    || !Array.isArray(data.couponIds)
    || !data.couponIds.every((id) => Number.isSafeInteger(id) && Number(id) > 0)
  ) {
    return null;
  }

  return {
    author: data.author,
    category: data.category,
    couponIds: data.couponIds,
    description,
    discountedPrice: data.discountedPrice,
    itemName: data.itemName,
    productId: data.productId,
    publishedAt: data.publishedAt,
    publisher: data.publisher,
    reviewCount: data.reviewCount,
    reviewRate: data.reviewRate,
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
      await fetchPublic(`/api/v1/products/${productId}`, { signal }),
    );

    if (!result.ok) {
      if (result.status === 404) {
        return { ok: false, reason: "not-found" };
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
