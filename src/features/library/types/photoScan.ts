// 사진으로 책 담기(BE #509) 화면이 쓰는 모양이다. BE 응답은 api/photoScanApi.ts 가 이 모양으로 바꾼다.

// cover: 표지 한 권, shelf: 책장(책등 여러 권), none: 책이 보이지 않는 사진
export type PhotoType = "cover" | "shelf" | "none";

export interface PhotoScanBook {
  author: string | null;
  // 나의 도서관에 담을 때 넘기는 BE 책 번호
  bookId: number;
  coverUrl: string | null;
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

export type PhotoScanFailure = { ok: false; reason: "unreadable" | "too_large" | "timeout" | "error" };

export type ScanPhoto = (
  photo: Blob,
  options: { onPhase: (phase: PhotoScanPhase) => void; signal: AbortSignal },
) => Promise<{ data: PhotoScanResult; ok: true } | PhotoScanFailure>;

export type SaveScannedBooks = (
  bookIds: number[],
) => Promise<{ ok: true } | { ok: false }>;

export interface PhotoScanSaved {
  missedCount: number;
  savedCount: number;
}

// 나의 도서관 → 사진 화면으로 고른 사진을 넘긴다
export interface LibraryPhotoLocationState {
  photo?: File;
}

// 사진 화면에서 담고 나의 도서관으로 돌아갈 때 결과를 넘긴다
export interface LibraryLocationState {
  photoScanSaved?: PhotoScanSaved;
}
