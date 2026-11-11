import { useEffect, useEffectEvent, useState } from "react";

import type { PhotoScanBook, SearchBooks } from "@/features/library/types/photoScan";

// found: 상품 페이지로 갈 수 있다, notSold: 같은 책을 찾았지만 팔지 않는다, unknown: 검색에서 같은 책을 못 찾았거나 검색이 실패했다
export type BookProduct =
  | { status: "loading" }
  | { productId: number; status: "found" }
  | { status: "notSold" }
  | { status: "unknown" };

// 책 번호로 상품을 찾는 API 가 없어 제목으로 검색하고 같은 책 번호를 고른다
export function useBookProductId(book: PhotoScanBook, searchBooks: SearchBooks): BookProduct {
  const { bookId, title } = book;
  const [lookup, setLookup] = useState<{ bookId: number; product: BookProduct } | null>(null);
  // 부모가 렌더마다 새 함수를 넘겨도 다시 찾지 않게 한다
  const callSearchBooks = useEffectEvent((...args: Parameters<SearchBooks>) => searchBooks(...args));

  useEffect(() => {
    const controller = new AbortController();
    void callSearchBooks(title, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      const same = result.ok ? result.data.find((item) => item.bookId === bookId) : undefined;
      let product: BookProduct = { status: "unknown" };
      if (same) product = same.productId === null ? { status: "notSold" } : { productId: same.productId, status: "found" };
      setLookup({ bookId, product });
    });
    return () => controller.abort();
  }, [bookId, title]);

  return lookup?.bookId === bookId ? lookup.product : { status: "loading" };
}
