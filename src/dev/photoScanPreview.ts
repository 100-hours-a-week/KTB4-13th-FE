import { photoScanPreviewCases, type PhotoScanPreviewCase } from "@/dev/fixtures/photoScan";
import { previewLibraryApi } from "@/dev/libraryPreview";
import type { SaveScannedBooks, ScanPhoto } from "@/features/library/types/photoScan";

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

// 실제 저장 요청 없이 미리보기 도서관에 담는다
export function createPreviewSaveBooks(previewCase: PhotoScanPreviewCase): SaveScannedBooks {
  const { saveFails } = photoScanPreviewCases[previewCase];
  return async (bookIds) => {
    if (saveFails) {
      await wait(UPLOAD_DELAY_MS);
      return { ok: false };
    }
    return previewLibraryApi.addBooks(bookIds);
  };
}
