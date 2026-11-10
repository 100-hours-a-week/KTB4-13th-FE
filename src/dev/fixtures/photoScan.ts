import type { PhotoScanResult } from "@/features/library/types/photoScan";

// 개발용 미리보기 결과다. 책장 결과는 AI #615 시험 사진(CNU book-spine-dataset)을 돌린 결과에서 골랐다.
export type PhotoScanPreviewCase =
  | "shelf"
  | "cover"
  | "allMissed"
  | "noBooks"
  | "timeout"
  | "saveFailed";

const shelfResult: PhotoScanResult = {
  items: [
    { book: { author: "Peter Cooper 외", coverUrl: null, isbn: "9788970507538", publisher: "생능출판사", title: "루비 프로그래밍 언어", year: 2012 }, readText: "루비 프로그래밍 언어", state: "FOUND" },
    { book: { author: "재리드 랜더, 고석범", coverUrl: null, isbn: "9791161751610", publisher: "에이콘출판", title: "데이터 과학 입문자를 위한 R", year: 2018 }, readText: "데이터 과학 입문자를 위한 R", state: "FOUND" },
    { book: { author: "문혜영", coverUrl: null, isbn: "9791160508000", publisher: "길벗", title: "모두의 스크래치 알고리즘", year: 2019 }, readText: "모두의 스크래치 알고리즘", state: "FOUND" },
    { book: { author: "린다 리우카스, 이지선", coverUrl: null, isbn: "9788955823011", publisher: "길벗어린이", title: "헬로 루비", year: 2018 }, readText: "헬로 루비", state: "FOUND" },
    { book: null, readText: "Julia 프로그래밍", state: "NOT_FOUND" },
    { book: null, readText: "COVERT JAVA", state: "NOT_FOUND" },
    { book: null, readText: "Learning GNU Emacs", state: "NOT_FOUND" },
  ],
  photoType: "shelf",
};

export const photoScanPreviewCases: Record<
  PhotoScanPreviewCase,
  { label: string; result: PhotoScanResult | "timeout"; saveFails?: boolean }
> = {
  shelf: { label: "책장", result: shelfResult },
  cover: {
    label: "표지 한 권",
    result: {
      items: [{ book: { author: "손원평", coverUrl: null, isbn: "9791190090018", publisher: "창비", title: "아몬드", year: 2017 }, readText: "아몬드 손원평", state: "FOUND" }],
      photoType: "cover",
    },
  },
  allMissed: {
    label: "모두 못 찾음",
    result: { items: shelfResult.items.filter((item) => item.state === "NOT_FOUND"), photoType: "shelf" },
  },
  noBooks: { label: "책 없음", result: { items: [], photoType: "none" } },
  timeout: { label: "시간 초과", result: "timeout" },
  saveFailed: { label: "담기 실패", result: shelfResult, saveFails: true },
};
