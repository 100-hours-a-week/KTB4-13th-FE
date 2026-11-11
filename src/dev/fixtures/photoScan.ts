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

// 미리보기 도서관·검색이 쓰는 책. 담은 날짜는 미리보기를 연 날 기준으로 며칠 전인지로 둔다(이번 달·지난달 묶음이 보이게)
export interface PreviewLibrarySeed {
  book: PhotoScanSearchBook;
  daysAgo: number;
}

const libraryBook = (bookId: number, title: string, author: string, productId: number | null): PhotoScanSearchBook => ({
  author,
  bookId,
  coverUrl: null,
  productId,
  publisher: null,
  title,
  year: null,
});

export const libraryPreviewSeeds: PreviewLibrarySeed[] = [
  { book: libraryBook(91001, "소년이 온다", "한강", 91101), daysAgo: 0 },
  { book: libraryBook(91002, "작별하지 않는다", "한강", 91102), daysAgo: 2 },
  { book: searchPreviewBooks[0], daysAgo: 5 },
  { book: libraryBook(91004, "불편한 편의점", "김호연", 91104), daysAgo: 30 },
  { book: libraryBook(91005, "데미안", "헤르만 헤세", null), daysAgo: 32 },
  { book: libraryBook(91006, "채식주의자", "한강", 91106), daysAgo: 33 },
  { book: libraryBook(91007, "여행의 이유", "김영하", 91107), daysAgo: 34 },
  { book: libraryBook(91008, "코스모스", "칼 세이건", 91108), daysAgo: 65 },
  { book: libraryBook(90004, "헬로 루비", "린다 리우카스, 이지선", null), daysAgo: 66 },
];

// 도서관에는 없고 검색에만 나오는 책. 한강의 다른 책 줄과 '이름만 같은 다른 저자' 거르기를 볼 수 있다
export const libraryPreviewCatalog: PhotoScanSearchBook[] = [
  libraryBook(91011, "흰", "한강", 91111),
  libraryBook(91012, "희랍어 시간", "한강", 91112),
  libraryBook(91013, "바람이 분다, 가라", "한강", null),
  libraryBook(91014, "채식주의자 (리커버)", "한강", 91114),
  libraryBook(91015, "한강 유역의 역사", "김철수", 91115),
  libraryBook(91016, "아몬드", "손원평", 91116),
];
