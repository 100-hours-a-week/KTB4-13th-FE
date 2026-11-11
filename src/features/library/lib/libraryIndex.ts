import { useEffect, useSyncExternalStore } from "react";

import { fetchLibraryBooks } from "@/features/library/api/libraryApi";
import type { LibraryBook } from "@/features/library/types/library";

// 검색 결과·상품 상세에서 "내 도서관에 있어요"를 보여 줄 때 쓰는, 이미 담은 책 번호 모음
export interface LibraryIndex {
  bookIds: ReadonlySet<number>;
  productIds: ReadonlySet<number>;
}

// 다른 화면에서 들어올 때마다 도서관을 다시 받지 않는다. 도서관 화면이 담고 빼면 바로 고쳐 둔다
const STALE_MS = 60_000;

let index: LibraryIndex | null = null;
let loadedAt = 0;
let loading: AbortController | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function rememberLibraryBooks(books: LibraryBook[]) {
  index = {
    bookIds: new Set(books.map((book) => book.bookId)),
    productIds: new Set(books.flatMap((book) => (book.productId === null ? [] : [book.productId]))),
  };
  loadedAt = Date.now();
  notify();
}

// 로그아웃하면 다른 계정에 앞 사람 도서관이 보이지 않게 지운다
function forgetLibraryBooks() {
  loading?.abort();
  loading = null;
  if (index === null && loadedAt === 0) return;
  index = null;
  loadedAt = 0;
  notify();
}

function loadLibraryBooks() {
  if (loading || Date.now() - loadedAt < STALE_MS) return;
  const controller = new AbortController();
  loading = controller;
  void fetchLibraryBooks(controller.signal).then((result) => {
    if (loading !== controller) return;
    loading = null;
    // 못 받으면 표시만 안 한다(검색·상세는 그대로 쓸 수 있다)
    if (result.ok) rememberLibraryBooks(result.data);
  });
}

// 로그인했을 때만 받는다. 아직 못 받았으면 null
export function useLibraryIndex(isAuthenticated: boolean): LibraryIndex | null {
  const snapshot = useSyncExternalStore(subscribe, () => index);

  useEffect(() => {
    if (isAuthenticated) loadLibraryBooks();
    else forgetLibraryBooks();
  }, [isAuthenticated]);

  return isAuthenticated ? snapshot : null;
}
