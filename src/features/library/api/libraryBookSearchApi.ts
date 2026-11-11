import { fetchBookSearchResults } from "@/features/search/api/bookSearchApi";
import type { SearchBooks } from "@/features/library/types/photoScan";

// BE 검색 API 의 검색어 상한
const MAX_QUERY_LENGTH = 200;
const RESULT_SIZE = 20;

// 사진으로 담기에서 쓰는 책 검색. 검색 화면과 같은 GET /api/v1/search 를 부른다
export const searchLibraryBooks: SearchBooks = async (query, signal) => {
  const result = await fetchBookSearchResults({
    category: null,
    cursor: null,
    priceMax: null,
    priceMin: null,
    pubYearFrom: null,
    pubYearTo: null,
    query: query.trim().slice(0, MAX_QUERY_LENGTH),
    size: RESULT_SIZE,
    sort: "popular",
  }, signal);

  if (!result.ok) return { ok: false, reason: result.reason === "rate-limited" ? "rate_limited" : "error" };

  return {
    data: result.data.items.map((item) => ({
      author: item.author,
      bookId: item.bookId,
      coverUrl: item.coverUrl,
      productId: item.productId,
      publisher: item.publisher,
      title: item.title,
      // 검색 결과에는 출간 연도가 없다
      year: null,
    })),
    ok: true,
  };
};
