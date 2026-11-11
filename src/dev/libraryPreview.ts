import { libraryPreviewCatalog, libraryPreviewSeeds, photoScanPreviewCases, searchPreviewBooks } from "@/dev/fixtures/photoScan";
import { foundBooks } from "@/features/library/hooks/usePhotoScan";
import type { LibraryApi, LibraryBook } from "@/features/library/types/library";
import type { PhotoScanSearchBook, SearchBooks } from "@/features/library/types/photoScan";

const DELAY_MS = 500;

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

// BE 처럼 시간대 없는 "2026-11-11T15:03:22"
function localDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateTime(date);
}

// 검색·담기에서 찾을 수 있는 모든 책(사진 인식 결과 책 포함)
function catalog(): PhotoScanSearchBook[] {
  const scanned = Object.values(photoScanPreviewCases).flatMap(({ result }) =>
    result === "timeout" ? [] : foundBooks(result).map((book) => ({ ...book, productId: null })),
  );
  const books = [...libraryPreviewSeeds.map(({ book }) => book), ...libraryPreviewCatalog, ...searchPreviewBooks, ...scanned];
  return [...new Map(books.map((book) => [book.bookId, book])).values()];
}

function toLibraryBook(book: PhotoScanSearchBook, libraryBookId: number, addedAt: string): LibraryBook {
  return {
    addedAt,
    author: book.author ?? "",
    bookId: book.bookId,
    coverImageUrl: book.coverUrl,
    libraryBookId,
    productId: book.productId,
    title: book.title,
  };
}

// 미리보기 도서관. 새로 고침하면 처음으로 돌아간다
let library: LibraryBook[] = [];
// 뺐다가 다시 담으면 BE 처럼 같은 libraryBookId 를 되살린다
const removed = new Map<number, LibraryBook>();
let nextLibraryBookId = 1;

export function resetPreviewLibrary(isEmpty: boolean) {
  removed.clear();
  library = isEmpty ? [] : libraryPreviewSeeds.map(({ book, daysAgo: days }) => toLibraryBook(book, nextLibraryBookId++, daysAgo(days)));
}

// 검색어 낱말 하나라도 제목·저자에 들어 있으면 나온다
export const previewSearchBooks: SearchBooks = async (query, signal) => {
  await wait(DELAY_MS, signal);
  const words = query.trim().toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean);
  const data = catalog().filter((book) =>
    words.some((word) => `${book.title} ${book.author ?? ""}`.toLocaleLowerCase("ko-KR").includes(word)),
  );
  return { data, ok: true };
};

export const previewLibraryApi: LibraryApi = {
  addBooks: async (bookIds) => {
    await wait(DELAY_MS);
    const books = catalog();
    for (const bookId of bookIds) {
      if (library.some((book) => book.bookId === bookId)) continue;
      const revived = removed.get(bookId);
      const found = books.find((book) => book.bookId === bookId);
      if (revived) {
        removed.delete(bookId);
        library.push(revived);
      } else if (found) {
        library.push(toLibraryBook(found, nextLibraryBookId++, localDateTime(new Date())));
      }
    }
    return { ok: true };
  },
  deleteBooks: async (libraryBookIds) => {
    await wait(DELAY_MS);
    library = library.filter((book) => {
      if (!libraryBookIds.includes(book.libraryBookId)) return true;
      removed.set(book.bookId, book);
      return false;
    });
    return { ok: true };
  },
  fetchBooks: async (signal) => {
    await wait(DELAY_MS, signal);
    const data = [...library].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.libraryBookId - a.libraryBookId);
    return { data, ok: true };
  },
  searchBooks: previewSearchBooks,
};
