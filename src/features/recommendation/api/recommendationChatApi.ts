import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  RecommendationChatCard,
  RecommendationChatReply,
  RecommendationChatRequest,
} from "@/features/recommendation/types/recommendationChat";

export type RecommendationChatResult =
  | { data: RecommendationChatReply; ok: true }
  | {
      ok: false;
      reason: "invalid-request" | "busy" | "timeout" | "error";
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null | undefined {
  return value === undefined || value === null || typeof value === "number";
}

function parseCard(value: unknown): RecommendationChatCard | null {
  if (
    !isRecord(value) ||
    typeof value.recommendationCardId !== "number" ||
    typeof value.bookId !== "number" ||
    typeof value.title !== "string" ||
    typeof value.matchScore !== "number" ||
    !isNullableNumber(value.productId) ||
    !isNullableNumber(value.price) ||
    !isNullableString(value.author) ||
    !isNullableString(value.coverImageUrl) ||
    !isNullableString(value.reasonShort)
  ) {
    return null;
  }

  return {
    author: value.author ?? null,
    bookId: value.bookId,
    coverImageUrl: value.coverImageUrl ?? null,
    matchScore: value.matchScore,
    price: value.price ?? null,
    productId: value.productId ?? null,
    reasonShort: value.reasonShort ?? null,
    recommendationCardId: value.recommendationCardId,
    title: value.title,
  };
}

function parseReply(data: unknown): RecommendationChatReply | null {
  if (
    !isRecord(data) ||
    typeof data.reply !== "string" ||
    !isRecord(data.spec) ||
    !Array.isArray(data.cards) ||
    !isNullableString(data.followup)
  ) {
    return null;
  }

  const cards = data.cards.map(parseCard);

  if (!cards.every((card): card is RecommendationChatCard => card !== null)) {
    return null;
  }

  return {
    cards,
    followup: data.followup ?? null,
    reply: data.reply,
    spec: data.spec,
  };
}

function toFailureReason(status: number) {
  if (status === 400) {
    return "invalid-request" as const;
  }
  if (status === 429 || status === 503) {
    return "busy" as const;
  }
  if (status === 504) {
    return "timeout" as const;
  }
  return "error" as const;
}

// The backend identifies the user from the access token; no userId is sent.
export async function sendRecommendationChat(
  request: RecommendationChatRequest,
): Promise<RecommendationChatResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/recommend/chat", {
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    if (!result.ok) {
      return { ok: false, reason: toFailureReason(result.status) };
    }

    const data = parseReply(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
