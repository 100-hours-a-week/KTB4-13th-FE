import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import { searchLibraryBooks } from "@/features/library/api/libraryBookSearchApi";
import type { LibraryApi, LibraryBook } from "@/features/library/types/library";

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

// BE #545 는 한 번에 50권까지 받는다. 사진 한 장에서는 100권까지 나올 수 있어 나눠 보낸다.
// 이미 담긴 책은 그대로 두는 API 라, 중간에 실패해 다시 보내도 같은 책이 두 번 담기지 않는다.
const ADD_BOOKS_CHUNK_SIZE = 50;

export async function addLibraryBooks(
  bookIds: number[],
): Promise<{ ok: true } | LibraryFailure> {
  try {
    for (let start = 0; start < bookIds.length; start += ADD_BOOKS_CHUNK_SIZE) {
      const result = await parseApiResponse(
        await fetchWithAuth("/api/v1/library/books", {
          body: JSON.stringify({ bookIds: bookIds.slice(start, start + ADD_BOOKS_CHUNK_SIZE) }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      );
      if (!result.ok) return failure(result.status);
    }

    return { ok: true };
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

export const libraryApi: LibraryApi = {
  addBooks: addLibraryBooks,
  deleteBooks: deleteLibraryBooks,
  fetchBooks: fetchLibraryBooks,
  searchBooks: searchLibraryBooks,
};
