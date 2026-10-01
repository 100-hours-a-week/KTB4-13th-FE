import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  RecommendationFeedItem,
  RecommendationFeedPage,
  RecommendationFeedQuery,
} from "@/features/recommendation/types/recommendationFeed";

export type RecommendationFeedResult =
  | { data: RecommendationFeedPage; ok: true }
  | { ok: false; reason: "cursor-expired" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function parseRecommendationFeedItem(
  value: unknown,
): RecommendationFeedItem | null {
  if (
    !isRecord(value) ||
    typeof value.bookId !== "number" ||
    (value.productId !== null && typeof value.productId !== "number") ||
    typeof value.title !== "string" ||
    typeof value.inStock !== "boolean" ||
    typeof value.matchScore !== "number" ||
    !isNullableString(value.author) ||
    !isNullableString(value.coverUrl) ||
    (value.price !== undefined &&
      value.price !== null &&
      typeof value.price !== "number")
  ) {
    return null;
  }

  return {
    author: value.author ?? null,
    bookId: value.bookId,
    coverUrl: value.coverUrl ?? null,
    inStock: value.inStock,
    matchScore: value.matchScore,
    price: value.price ?? null,
    productId: value.productId,
    title: value.title,
  };
}

function parseRecommendationFeedPage(
  data: unknown,
): RecommendationFeedPage | null {
  if (
    !isRecord(data) ||
    !Array.isArray(data.items) ||
    typeof data.coldStart !== "boolean" ||
    !isNullableString(data.nextCursor)
  ) {
    return null;
  }

  const items = data.items.map(parseRecommendationFeedItem);

  if (!items.every((item): item is RecommendationFeedItem => item !== null)) {
    return null;
  }

  return { coldStart: data.coldStart, items, nextCursor: data.nextCursor ?? null };
}

function toSearchParams(query: RecommendationFeedQuery) {
  const searchParams = new URLSearchParams({ surface: query.surface });
  const optionalParams: [string, number | string | null][] =
    query.surface === "home"
      ? [["cursor", query.cursor]]
      : [
          ["size", query.size],
          ["sort", query.sort],
          ["pubYearFrom", query.pubYearFrom],
          ["pubYearTo", query.pubYearTo],
          ["matchScoreMin", query.matchScoreMin],
          ["cursor", query.cursor],
        ];

  optionalParams.forEach(([key, value]) => {
    if (value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

// The backend resolves the user from the access token; the frontend never sends userId.
export async function fetchRecommendationFeed(
  query: RecommendationFeedQuery,
  signal?: AbortSignal,
): Promise<RecommendationFeedResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(
        `/api/v1/recommend/feed?${toSearchParams(query).toString()}`,
        { signal },
      ),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 410 ? "cursor-expired" : "error",
      };
    }

    const data = parseRecommendationFeedPage(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
