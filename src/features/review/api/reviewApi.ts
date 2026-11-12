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

export type ReviewCountResult =
  | { count: number; ok: true }
  | { ok: false; reason: "error" };

export type ReviewMutationResult =
  | { reviewId: number; ok: true }
  | {
      ok: false;
      reason:
        | "no-reviewable-order"
        | "already-reviewed"
        | "edit-expired"
        | "invalid-request"
        | "unauthorized"
        | "error";
    };

export type MyProductReviewResult =
  | { ok: true; review: ProductReview | null }
  | { ok: false };

// BE ErrorCode: REVIEW_HAS_NOT_ORDER, REVIEW_ALREADY_REVIEWED, REVIEW_UPDATE_EXPIRED
const REVIEW_ERROR_REASONS = {
  E7000: "no-reviewable-order",
  E7001: "already-reviewed",
  E7002: "edit-expired",
} as const;

function reviewErrorReason(code: string | undefined) {
  return code !== undefined && code in REVIEW_ERROR_REASONS
    ? REVIEW_ERROR_REASONS[code as keyof typeof REVIEW_ERROR_REASONS]
    : null;
}

const MY_REVIEW_PAGE_LIMIT = 100;
const MY_REVIEW_MAX_PAGES = 5;

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

export async function fetchProductReviewCount(
  productId: number,
  signal?: AbortSignal,
): Promise<ReviewCountResult> {
  const params = new URLSearchParams({
    targetId: String(productId),
    targetType: "PRODUCT",
  });

  try {
    const result = await parseApiResponse(
      await fetchPublic(`/api/v1/reviews/count?${params.toString()}`, { signal, cache: "no-store" }),
    );
    return result.ok && typeof result.data === "number" &&
      Number.isSafeInteger(result.data) && result.data >= 0
      ? { count: result.data, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// The list API has no "my review" filter, so walk pages until isMyReview shows up.
export async function fetchMyProductReview(
  productId: number,
  signal?: AbortSignal,
): Promise<MyProductReviewResult> {
  for (let page = 0; page < MY_REVIEW_MAX_PAGES; page += 1) {
    const result = await fetchProductReviews(
      productId,
      page * MY_REVIEW_PAGE_LIMIT,
      MY_REVIEW_PAGE_LIMIT,
      signal,
    );
    if (!result.ok) return { ok: false };
    const review = result.data.reviews.find((item) => item.isMyReview);
    if (review) return { ok: true, review };
    if (!result.data.hasNext) return { ok: true, review: null };
  }
  return { ok: false };
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
      const reason = reviewErrorReason(result.error?.code);
      if (reason) return { ok: false, reason };
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
      const reason = reviewErrorReason(result.error?.code);
      if (reason) return { ok: false, reason };
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
