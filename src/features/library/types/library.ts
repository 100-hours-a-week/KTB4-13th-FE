import type { SearchBooks } from "@/features/library/types/photoScan";

export interface LibraryBook {
  // BE LocalDateTime (시간대 없음, 서버 시각)
  addedAt: string;
  author: string;
  bookId: number;
  coverImageUrl: string | null;
  libraryBookId: number;
  productId: number | null;
  title: string;
}

type LibraryResult = { ok: true } | { ok: false };

// 나의 도서관 화면이 부르는 API. 개발용 미리보기는 가짜 구현을 넘긴다(PhotoScanFlow 와 같은 방식)
export interface LibraryApi {
  // 이미 담긴 책은 그대로 두고, 뺐던 책을 다시 담으면 같은 libraryBookId 가 되살아난다
  addBooks: (bookIds: number[]) => Promise<LibraryResult>;
  deleteBooks: (libraryBookIds: number[]) => Promise<LibraryResult>;
  // 담은 시각이 늦은 책부터 온다
  fetchBooks: (signal: AbortSignal) => Promise<{ data: LibraryBook[]; ok: true } | { ok: false }>;
  searchBooks: SearchBooks;
}
