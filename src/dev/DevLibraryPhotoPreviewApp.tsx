import { useState } from "react";

import { AppLayout } from "@/app/layouts/AppLayout";
import { photoScanPreviewCases, type PhotoScanPreviewCase } from "@/dev/fixtures/photoScan";
import { PhotoScanFlow } from "@/features/library/components/PhotoScanFlow";
import type { SaveScannedBooks, ScanPhoto } from "@/features/library/types/photoScan";

const UPLOAD_DELAY_MS = 800;
const RECOGNIZE_DELAY_MS = 1800;

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

export default function DevLibraryPhotoPreviewApp() {
  const [selectedCase, setSelectedCase] = useState<PhotoScanPreviewCase>("shelf");
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const previewCase = photoScanPreviewCases[selectedCase];

  // 실제 업로드·인식 요청 없이 정해 둔 결과를 돌려준다
  const scanPhoto: ScanPhoto = async (_photo, { onPhase, signal }) => {
    onPhase("uploading");
    await wait(UPLOAD_DELAY_MS, signal);
    onPhase("recognizing");
    await wait(RECOGNIZE_DELAY_MS, signal);
    return previewCase.result === "timeout"
      ? { ok: false, reason: "timeout" }
      : { data: previewCase.result, ok: true };
  };

  const saveBooks: SaveScannedBooks = async () => {
    await wait(UPLOAD_DELAY_MS, new AbortController().signal);
    return previewCase.saveFails ? { ok: false } : { ok: true };
  };

  return (
    <AppLayout>
      <div className="flex h-dvh min-w-0 flex-col bg-surface">
        <header className="page-content shrink-0 border-b border-hairline py-3">
          <h1 className="type-title text-text-primary">사진으로 담기 미리보기</h1>
          <p className="mt-1 type-caption text-text-secondary">개발 전용 · 실제 업로드·인식·저장 요청 없음</p>
          <fieldset className="mt-3">
            <legend className="sr-only">인식 결과</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(photoScanPreviewCases) as PhotoScanPreviewCase[]).map((caseKey) => (
                <button
                  aria-pressed={selectedCase === caseKey}
                  className={`min-h-11 rounded-control border px-3 type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selectedCase === caseKey ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-primary"
                  }`}
                  key={caseKey}
                  onClick={() => {
                    setSelectedCase(caseKey);
                    setSavedCount(null);
                  }}
                  type="button"
                >
                  {photoScanPreviewCases[caseKey].label}
                </button>
              ))}
            </div>
          </fieldset>
        </header>
        {savedCount !== null ? (
          <main className="page-content flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="type-title" role="status">{savedCount}권을 담았어요</p>
            <p className="type-caption text-text-secondary">실제 화면에서는 나의 도서관으로 돌아가 목록을 다시 불러와요.</p>
          </main>
        ) : (
          // 결과를 바꾸면 처음 단계부터 다시 본다
          <PhotoScanFlow key={selectedCase} onSaved={setSavedCount} saveBooks={saveBooks} scanPhoto={scanPhoto} />
        )}
      </div>
    </AppLayout>
  );
}
