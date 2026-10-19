import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type { RecommendationCardDetail } from "@/features/recommendation/types/recommendationCard";

export type RecommendationCardDetailResult =
  | { data: RecommendationCardDetail; ok: true }
  | { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown) {
  return value === undefined || value === null || typeof value === "string";
}

function parseRecommendationCardDetail(
  data: unknown,
): RecommendationCardDetail | null {
  if (
    !isRecord(data) ||
    typeof data.recommendationCardId !== "number" ||
    typeof data.bookId !== "number" ||
    !isNullableString(data.reasonLong)
  ) {
    return null;
  }

  return {
    bookId: data.bookId,
    reasonLong: data.reasonLong ?? null,
    recommendationCardId: data.recommendationCardId,
  };
}

export async function fetchRecommendationCardDetail(
  recommendationCardId: number,
  signal?: AbortSignal,
): Promise<RecommendationCardDetailResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(
        `/api/v1/recommend/cards/${recommendationCardId}`,
        { signal },
      ),
    );

    if (!result.ok) {
      return { ok: false };
    }

    const data = parseRecommendationCardDetail(result.data);
    return data?.recommendationCardId === recommendationCardId
      ? { data, ok: true }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}
