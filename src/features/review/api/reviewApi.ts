import { fetchPublic } from "@/common/api/httpClient";
import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CreateProductReviewRequest,
  ProductReview,
  ProductReviewPage,
  UpdateProductReviewRequest,
} from "@/features/review/types/review";

export type ReviewListResult =
  | { data: ProductReviewPage; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

export type ReviewMutationResult =
  | { reviewId: number; ok: true }
  | { ok: false; reason: "invalid-request" | "unauthorized" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseReview(value: unknown): ProductReview | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    value.targetType !== "PRODUCT" ||
    typeof value.targetId !== "number" ||
    typeof value.rate !== "number" ||
    typeof value.content !== "string" ||
    typeof value.isSpoiler !== "boolean" ||
    typeof value.isMyReview !== "boolean"
  ) {
    return null;
  }

  return {
    content: value.content,
    id: value.id,
    isMyReview: value.isMyReview,
    isSpoiler: value.isSpoiler,
    productId: value.targetId,
    rate: value.rate,
  };
}

function parseReviewPage(value: unknown): ProductReviewPage | null {
  if (!isRecord(value) || !Array.isArray(value.content) || typeof value.hasNext !== "boolean") {
    return null;
  }
  const reviews = value.content.map(parseReview);
  if (reviews.some((review) => review === null)) return null;
  return {
    hasNext: value.hasNext,
    reviews: reviews.filter((review): review is ProductReview => review !== null),
  };
}

export async function fetchProductReviews(
  productId: number,
  offset: number,
  limit: number,
  signal?: AbortSignal,
  publicAccess = false,
): Promise<ReviewListResult> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    targetId: String(productId),
    targetType: "PRODUCT",
  });

  try {
    const result = await parseApiResponse(
      await (publicAccess ? fetchPublic : fetchWithAuth)(`/api/v1/reviews?${params.toString()}`, { signal, cache: "no-store" }),
    );
    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }
    const data = parseReviewPage(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function createProductReview(
  request: CreateProductReviewRequest,
): Promise<ReviewMutationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/reviews", {
        body: JSON.stringify({
          content: request.content,
          isSpoiler: request.isSpoiler,
          rate: request.rate,
          targetId: request.productId,
          targetType: "PRODUCT",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    if (!result.ok) {
      if (result.status === 400 || result.status === 404) {
        return { ok: false, reason: "invalid-request" };
      }
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }

    return typeof result.data === "number"
      ? { ok: true, reviewId: result.data }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function updateProductReview(
  reviewId: number,
  request: UpdateProductReviewRequest,
): Promise<ReviewMutationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/reviews/${reviewId}`, {
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
    );
    if (!result.ok) {
      if (result.status === 400 || result.status === 403 || result.status === 404) {
        return { ok: false, reason: "invalid-request" };
      }
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }
    return typeof result.data === "number"
      ? { ok: true, reviewId: result.data }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function deleteProductReview(
  reviewId: number,
): Promise<ReviewMutationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/reviews/${reviewId}`, { method: "DELETE" }),
    );
    if (!result.ok) {
      if (result.status === 403 || result.status === 404) {
        return { ok: false, reason: "invalid-request" };
      }
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }
    return typeof result.data === "number"
      ? { ok: true, reviewId: result.data }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
