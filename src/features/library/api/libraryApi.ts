import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type { LibraryBook } from "@/features/library/types/library";

type LibraryFailure = { ok: false; reason: "unauthorized" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseLibraryBook(value: unknown): LibraryBook | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.libraryBookId) ||
    !Number.isSafeInteger(value.bookId) ||
    (value.productId !== null && !Number.isSafeInteger(value.productId)) ||
    typeof value.title !== "string" ||
    typeof value.author !== "string" ||
    (value.coverImageUrl !== null && typeof value.coverImageUrl !== "string") ||
    typeof value.addedAt !== "string"
  ) {
    return null;
  }

  return value as unknown as LibraryBook;
}

function failure(status: number): LibraryFailure {
  return {
    ok: false,
    reason: status === 401 ? "unauthorized" : "error",
  };
}

export async function fetchLibraryBooks(
  signal?: AbortSignal,
): Promise<{ data: LibraryBook[]; ok: true } | LibraryFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/library/books", { signal }),
    );
    if (!result.ok) return failure(result.status);
    if (!isRecord(result.data) || !Array.isArray(result.data.books)) {
      return { ok: false, reason: "error" };
    }

    const books = result.data.books.map(parseLibraryBook);
    return books.every((book): book is LibraryBook => book !== null)
      ? { data: books, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function deleteLibraryBooks(
  libraryBookIds: number[],
): Promise<{ ok: true } | LibraryFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/library/books", {
        body: JSON.stringify({ libraryBookIds }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      }),
    );

    return result.ok ? { ok: true } : failure(result.status);
  } catch {
    return { ok: false, reason: "error" };
  }
}
