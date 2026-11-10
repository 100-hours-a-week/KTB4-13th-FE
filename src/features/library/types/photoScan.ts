// 사진으로 책 담기(BE #509) 화면이 쓰는 모양이다. BE 응답 칸 이름은 아직 정해지지 않아,
// 연동 PR 에서 BE 응답을 이 모양으로 바꾸는 adapter 를 둔다.

// cover: 표지 한 권, shelf: 책장(책등 여러 권), none: 책이 보이지 않는 사진
export type PhotoType = "cover" | "shelf" | "none";

export interface PhotoScanBook {
  author: string;
  coverUrl: string | null;
  // 나의 도서관에 담을 때 넘기는 책 키
  isbn: string;
  publisher: string | null;
  title: string;
  year: number | null;
}

export type PhotoScanItem =
  | { book: PhotoScanBook; readText: string; state: "FOUND" }
  | { book: null; readText: string; state: "NOT_FOUND" };

export interface PhotoScanResult {
  items: PhotoScanItem[];
  photoType: PhotoType;
}

export type PhotoScanPhase = "uploading" | "recognizing";

export type PhotoScanFailure = { ok: false; reason: "timeout" | "error" };

export type ScanPhoto = (
  photo: Blob,
  options: { onPhase: (phase: PhotoScanPhase) => void; signal: AbortSignal },
) => Promise<{ data: PhotoScanResult; ok: true } | PhotoScanFailure>;

export type SaveScannedBooks = (
  isbns: string[],
) => Promise<{ ok: true } | { ok: false }>;
