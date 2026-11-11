import { photoScanPreviewCases, searchPreviewBooks, type PhotoScanPreviewCase } from "@/dev/fixtures/photoScan";
import type { SaveScannedBooks, ScanPhoto, SearchBooks } from "@/features/library/types/photoScan";

const UPLOAD_DELAY_MS = 800;
const RECOGNIZE_DELAY_MS = 2000;

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

// 실제 업로드·인식 요청 없이 정해 둔 결과를 돌려준다
export function createPreviewScanPhoto(previewCase: PhotoScanPreviewCase): ScanPhoto {
  const { result } = photoScanPreviewCases[previewCase];
  return async (_photo, { onPhase, signal }) => {
    onPhase("uploading");
    await wait(UPLOAD_DELAY_MS, signal);
    onPhase("recognizing");
    await wait(RECOGNIZE_DELAY_MS, signal);
    return result === "timeout" ? { ok: false, reason: "timeout" } : { data: result, ok: true };
  };
}

// 실제 저장 요청 없이 성공·실패만 돌려준다
export function createPreviewSaveBooks(previewCase: PhotoScanPreviewCase): SaveScannedBooks {
  const { saveFails } = photoScanPreviewCases[previewCase];
  return async () => {
    await wait(UPLOAD_DELAY_MS);
    return saveFails ? { ok: false } : { ok: true };
  };
}

// 실제 검색 요청 없이 정해 둔 책을 돌려준다
export const previewSearchBooks: SearchBooks = async (_query, signal) => {
  await wait(UPLOAD_DELAY_MS, signal);
  return { data: searchPreviewBooks, ok: true };
};
