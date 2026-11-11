import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  PhotoScanFailure,
  PhotoScanItem,
  PhotoScanResult,
  PhotoType,
  ScanPhoto,
} from "@/features/library/types/photoScan";

// 사진으로 책 담기(BE #509): 업로드 주소 받기 → S3 에 올리기 → BE 가 AI 에 인식 맡기기.
// 칸 이름은 BE #546(업로드 주소)·#547(인식) 기준이다.

interface PhotoUpload {
  headers: Record<string, string>;
  photoKey: string;
  uploadUrl: string;
}

const PHOTO_TYPES: readonly PhotoType[] = ["cover", "shelf", "none"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isPhotoType(value: unknown): value is PhotoType {
  return PHOTO_TYPES.some((type) => type === value);
}

function parsePhotoUpload(value: unknown): PhotoUpload | null {
  if (
    !isRecord(value) ||
    typeof value.photoKey !== "string" ||
    typeof value.uploadUrl !== "string" ||
    !isRecord(value.headers)
  ) {
    return null;
  }

  const headers: Record<string, string> = {};
  for (const [name, headerValue] of Object.entries(value.headers)) {
    if (typeof headerValue !== "string") return null;
    headers[name] = headerValue;
  }

  return { headers, photoKey: value.photoKey, uploadUrl: value.uploadUrl };
}

function parseItem(value: unknown): PhotoScanItem | null {
  if (!isRecord(value) || typeof value.readText !== "string") return null;
  const { book, readText, state } = value;

  if (state === "NOT_FOUND") return book === null ? { book: null, readText, state } : null;
  if (state !== "FOUND" || !isRecord(book)) return null;

  if (
    !(book.bookId === null || Number.isSafeInteger(book.bookId)) ||
    typeof book.title !== "string" ||
    !isNullableString(book.author) ||
    !isNullableString(book.publisher) ||
    !isNullableString(book.coverUrl) ||
    !(book.year === null || Number.isSafeInteger(book.year))
  ) {
    return null;
  }

  // 우리 서점 책 번호로 잇지 못한 책은 담을 수 없어 못 찾은 책으로 보여 준다
  if (typeof book.bookId !== "number") {
    return { book: null, readText: readText || book.title, state: "NOT_FOUND" };
  }

  return {
    book: {
      author: book.author,
      bookId: book.bookId,
      coverUrl: book.coverUrl,
      publisher: book.publisher,
      title: book.title,
      year: typeof book.year === "number" ? book.year : null,
    },
    readText,
    state,
  };
}

function parseScanResult(value: unknown): PhotoScanResult | null {
  if (!isRecord(value) || !isPhotoType(value.photoType) || !Array.isArray(value.items)) {
    return null;
  }

  const items = value.items.map(parseItem);
  return items.every((item): item is PhotoScanItem => item !== null)
    ? { items, photoType: value.photoType }
    : null;
}

// BE #547 오류: 413 사진이 너무 큼, 422 읽을 수 없는 사진, 504 AI 응답 시간 초과(CloudFront 시간 초과도 504)
function scanFailure(status: number): PhotoScanFailure {
  if (status === 413) return { ok: false, reason: "too_large" };
  if (status === 422) return { ok: false, reason: "unreadable" };
  if (status === 504) return { ok: false, reason: "timeout" };
  return { ok: false, reason: "error" };
}

async function createPhotoUpload(photo: Blob, signal: AbortSignal): Promise<PhotoUpload | null> {
  const result = await parseApiResponse(
    await fetchWithAuth("/api/v1/library/photos/upload-url", {
      body: JSON.stringify({ contentLength: photo.size, contentType: photo.type }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal,
    }),
  );

  return result.ok ? parsePhotoUpload(result.data) : null;
}

// S3 주소에는 서명이 붙어 있어 로그에 남기지 않고, 로그인 토큰도 보내지 않는다
async function uploadPhoto(upload: PhotoUpload, photo: Blob, signal: AbortSignal): Promise<boolean> {
  const headers = new Headers();
  for (const [name, value] of Object.entries(upload.headers)) {
    // 길이는 브라우저가 본문 크기로 직접 붙인다. 서명한 길이와 같은 사진을 올린다
    if (name.toLowerCase() !== "content-length") headers.set(name, value);
  }

  const response = await fetch(upload.uploadUrl, { body: photo, headers, method: "PUT", signal });
  return response.ok;
}

export const scanLibraryPhoto: ScanPhoto = async (photo, { onPhase, signal }) => {
  try {
    onPhase("uploading");
    const upload = await createPhotoUpload(photo, signal);
    if (!upload || !(await uploadPhoto(upload, photo, signal))) {
      return { ok: false, reason: "error" };
    }

    onPhase("recognizing");
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/library/photos/scans", {
        body: JSON.stringify({ photoKey: upload.photoKey }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal,
      }),
    );
    if (!result.ok) return scanFailure(result.status);

    const data = parseScanResult(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
};
