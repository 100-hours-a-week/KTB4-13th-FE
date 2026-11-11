import type { PhotoScanResult, PhotoScanSearchBook } from "@/features/library/types/photoScan";

// 개발용 미리보기 결과다. 책장 결과는 AI #615 시험 사진(CNU book-spine-dataset)을 돌린 결과에서 골랐다.
export type PhotoScanPreviewCase =
  | "shelf"
  | "emptyLibrary"
  | "cover"
  | "coverMissed"
  | "allMissed"
  | "noBooks"
  | "timeout"
  | "saveFailed";

const shelfResult: PhotoScanResult = {
  items: [
    { book: { author: "Peter Cooper 외", bookId: 90001, coverUrl: null, publisher: "생능출판사", title: "루비 프로그래밍 언어", year: 2012 }, readText: "루비 프로그래밍 언어", state: "FOUND" },
    { book: { author: "재리드 랜더, 고석범", bookId: 90002, coverUrl: null, publisher: "에이콘출판", title: "데이터 과학 입문자를 위한 R", year: 2018 }, readText: "데이터 과학 입문자를 위한 R", state: "FOUND" },
    { book: { author: "문혜영", bookId: 90003, coverUrl: null, publisher: "길벗", title: "모두의 스크래치 알고리즘", year: 2019 }, readText: "모두의 스크래치 알고리즘", state: "FOUND" },
    { book: { author: "린다 리우카스, 이지선", bookId: 90004, coverUrl: null, publisher: "길벗어린이", title: "헬로 루비", year: 2018 }, readText: "헬로 루비", state: "FOUND" },
    { book: null, readText: "Julia 프로그래밍", state: "NOT_FOUND" },
    { book: null, readText: "COVERT JAVA", state: "NOT_FOUND" },
    { book: null, readText: "Learning GNU Emacs", state: "NOT_FOUND" },
  ],
  photoType: "shelf",
};

export const photoScanPreviewCases: Record<
  PhotoScanPreviewCase,
  { isLibraryEmpty?: boolean; label: string; result: PhotoScanResult | "timeout"; saveFails?: boolean }
> = {
  shelf: { label: "책장", result: shelfResult },
  emptyLibrary: { isLibraryEmpty: true, label: "빈 도서관", result: shelfResult },
  cover: {
    label: "표지 한 권",
    result: {
      items: [{ book: { author: "손원평", bookId: 90005, coverUrl: null, publisher: "창비", title: "아몬드", year: 2017 }, readText: "아몬드 손원평", state: "FOUND" }],
      photoType: "cover",
    },
  },
  coverMissed: {
    label: "표지 못 찾음",
    result: { items: [{ book: null, readText: "클린 코드 로버트 C. 마틴", state: "NOT_FOUND" }], photoType: "cover" },
  },
  allMissed: {
    label: "모두 못 찾음",
    result: { items: shelfResult.items.filter((item) => item.state === "NOT_FOUND"), photoType: "shelf" },
  },
  noBooks: { label: "책 없음", result: { items: [], photoType: "none" } },
  timeout: { label: "시간 초과", result: "timeout" },
  saveFailed: { label: "담기 실패", result: shelfResult, saveFails: true },
};

// 검색해서 담기·상품 찾기 미리보기에서 검색어와 상관없이 돌려주는 결과
export const searchPreviewBooks: PhotoScanSearchBook[] = [
  { author: "손원평", bookId: 90005, coverUrl: null, productId: 90105, publisher: "창비", title: "아몬드", year: null },
  { author: "로버트 C. 마틴", bookId: 90011, coverUrl: null, productId: 90111, publisher: "인사이트", title: "클린 코드", year: null },
  { author: "로버트 C. 마틴", bookId: 90012, coverUrl: null, productId: null, publisher: "인사이트", title: "클린 코드 (개정판)", year: null },
  { author: "Peter Cooper 외", bookId: 90013, coverUrl: null, productId: 90113, publisher: "생능출판사", title: "Julia 프로그래밍", year: null },
];

// 미리보기 도서관에 이미 담겨 있는 책
export const libraryPreviewBooks = [
  { author: "린다 리우카스, 이지선", coverUrl: null, title: "헬로 루비" },
  { author: "손원평", coverUrl: null, title: "아몬드" },
  { author: "김영하", coverUrl: null, title: "여행의 이유" },
  { author: "칼 세이건", coverUrl: null, title: "코스모스" },
  { author: "김호연", coverUrl: null, title: "불편한 편의점" },
  { author: "이미예", coverUrl: null, title: "달러구트 꿈 백화점" },
];
