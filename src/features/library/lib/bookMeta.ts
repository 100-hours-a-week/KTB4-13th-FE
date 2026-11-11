import type { PhotoScanBook } from "@/features/library/types/photoScan";

// 책 제목 아래 한 줄: 저자 · 출판사 · 연도(있는 것만)
export function bookMeta(book: Pick<PhotoScanBook, "author" | "publisher" | "year">) {
  return [book.author, book.publisher, book.year].filter(Boolean).join(" · ");
}
