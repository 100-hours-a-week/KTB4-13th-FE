import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchPublic } from "@/common/api/httpClient";
import type {
  BookSearchItem,
  BookSearchPage,
  BookSearchQuery,
} from "@/features/search/types/bookSearch";

export type BookSearchResult =
  | { data: BookSearchPage; ok: true }
  | { ok: false; reason: "cursor-expired" | "rate-limited" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function parseBookSearchItem(value: unknown): BookSearchItem | null {
  if (
    !isRecord(value) ||
    typeof value.bookId !== "number" ||
    typeof value.title !== "string" ||
    typeof value.inStock !== "boolean" ||
    !isNullableString(value.author) ||
    !isNullableString(value.publisher) ||
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
    price: value.price ?? null,
    publisher: value.publisher ?? null,
    title: value.title,
  };
}

function parseBookSearchPage(data: unknown): BookSearchPage | null {
  if (
    !isRecord(data) ||
    !Array.isArray(data.items) ||
    !isNullableString(data.nextCursor) ||
    !isNullableString(data.fallbackMessage)
  ) {
    return null;
  }

  const items = data.items.map(parseBookSearchItem);

  if (!items.every((item): item is BookSearchItem => item !== null)) {
    return null;
  }

  return {
    fallbackMessage: data.fallbackMessage ?? null,
    items,
    nextCursor: data.nextCursor ?? null,
  };
}

function toSearchParams(query: BookSearchQuery) {
  const searchParams = new URLSearchParams({
    query: query.query,
    size: String(query.size),
    sort: query.sort,
  });
  const optionalParams: [string, number | string | null][] = [
    ["priceMin", query.priceMin],
    ["priceMax", query.priceMax],
    ["pubYearFrom", query.pubYearFrom],
    ["pubYearTo", query.pubYearTo],
    ["cursor", query.cursor],
  ];

  optionalParams.forEach(([key, value]) => {
    if (value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

export async function fetchBookSearchResults(
  query: BookSearchQuery,
  signal?: AbortSignal,
): Promise<BookSearchResult> {
  try {
    const result = await parseApiResponse(
      await fetchPublic(`/api/v1/search?${toSearchParams(query).toString()}`, {
        signal,
      }),
    );

    if (!result.ok) {
      if (result.status === 410) {
        return { ok: false, reason: "cursor-expired" };
      }
      if (result.status === 429) {
        return { ok: false, reason: "rate-limited" };
      }
      return { ok: false, reason: "error" };
    }

    const data = parseBookSearchPage(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
