import { useState } from "react";

import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { PhotoCaptureSheet } from "@/features/library/components/PhotoCaptureSheet";
import { PhotoPreview } from "@/features/library/components/PhotoPreview";
import {
  foundBooks,
  usePhotoScan,
  type PhotoScanFailureReason,
  type PhotoScanStep,
} from "@/features/library/hooks/usePhotoScan";
import type { PhotoScanBook, PhotoScanSaved, SaveScannedBooks, ScanPhoto } from "@/features/library/types/photoScan";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

interface PhotoScanFlowProps {
  initialPhoto: File;
  onExit: () => void;
  onSaved: (saved: PhotoScanSaved) => void;
  saveBooks: SaveScannedBooks;
  scanPhoto: ScanPhoto;
}

const SHOT_TIPS = [
  "한 칸만 화면에 가득 차게 찍어 주세요.",
  "빛이 책등에 반사되지 않게 각도를 바꿔 주세요.",
  "메신저로 받은 사진은 작아져서 잘 안 읽힐 수 있어요.",
];

const FAILURE_COPY: Record<PhotoScanFailureReason, { description: string; hasTips: boolean; title: string }> = {
  error: { description: "잠시 뒤에 다시 시도해 주세요.", hasTips: false, title: "책을 찾지 못했어요" },
  no_books: { description: "사진이 흐리거나 너무 멀리서 찍은 것 같아요.", hasTips: true, title: "책등 글자를 읽지 못했어요" },
  timeout: { description: "책장은 한 칸씩 나눠 찍으면 더 빨라요.", hasTips: true, title: "시간이 너무 오래 걸렸어요" },
  too_large: { description: "다른 사진으로 다시 골라 주세요.", hasTips: false, title: "사진이 너무 커요" },
  unreadable: { description: "JPG나 PNG 사진으로 다시 골라 주세요.", hasTips: false, title: "이 사진은 열 수 없어요" },
};

function bookMeta(book: PhotoScanBook) {
  return [book.author, book.publisher, book.year].filter(Boolean).join(" · ");
}

function CheckMark() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ScanProgress({ phase }: { phase: Extract<PhotoScanStep, { kind: "scanning" }>["phase"] }) {
  const isUploaded = phase === "recognizing";
  return (
    <ol className="mt-5 flex flex-col gap-3.5 type-body">
      <li aria-current={isUploaded ? undefined : "step"} className={`flex items-center gap-2.5 ${isUploaded ? "text-text-secondary" : "font-semibold"}`}>
        {isUploaded ? (
          <span className="inline-flex size-5.5 shrink-0 items-center justify-center rounded-full bg-success text-white"><CheckMark /></span>
        ) : (
          <span aria-hidden="true" className="size-5.5 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
        )}
        {isUploaded ? "사진을 올렸어요" : "사진을 올리고 있어요"}
      </li>
      <li aria-current={isUploaded ? "step" : undefined} className={`flex items-center gap-2.5 ${isUploaded ? "font-semibold" : "text-text-secondary"}`}>
        <span
          aria-hidden="true"
          className={`size-5.5 shrink-0 rounded-full border-2 ${isUploaded ? "animate-spin border-primary border-t-transparent motion-reduce:animate-none" : "border-border-strong"}`}
        />
        책등 제목을 읽는 중이에요
      </li>
      <li className="flex items-center gap-2.5 text-text-secondary">
        <span aria-hidden="true" className="size-5.5 shrink-0 rounded-full border-2 border-border-strong" />
        우리 서점 책과 맞춰 볼게요
      </li>
    </ol>
  );
}

export function PhotoScanFlow({ initialPhoto, onExit, onSaved, saveBooks, scanPhoto }: PhotoScanFlowProps) {
  const { isSaving, photo, retake, retry, saveError, saveSelected, selectedBookIds, step, toggleBook } =
    usePhotoScan({ initialPhoto, onSaved, saveBooks, scanPhoto });
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const captureSheet = (
    <PhotoCaptureSheet isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} onPick={retake} />
  );

  if (step.kind === "result") {
    const books = foundBooks(step.result);
    const missed = step.result.items.filter((item) => item.state === "NOT_FOUND");

    return (
      <div className="flex h-full flex-col bg-surface">
        <AppPageHeader fallbackPath="/my/library" showCart={false} title="찾은 책 확인" />
        <main className="page-content min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="flex items-center gap-3 pt-4">
            <PhotoPreview alt="올린 책장 사진" className="h-13.5 w-18 shrink-0 rounded-control object-cover" photo={photo} />
            <div>
              <p className="type-title">책 {step.result.items.length}종을 읽었어요</p>
              <p className="type-caption text-text-secondary">
                찾은 책 {books.length} · 못 찾음 {missed.length}
              </p>
            </div>
          </div>

          {books.length > 0 ? (
            <>
              <p className="mt-3 type-caption text-text-secondary">제목이 사진 속 책과 다르면 체크를 풀어 주세요.</p>
              <section aria-labelledby="photo-scan-found" className="mt-2">
                <h2 className="flex min-h-12 items-center type-body font-semibold" id="photo-scan-found">
                  찾은 책 <span className="ml-1.5 text-text-secondary">{books.length}</span>
                </h2>
                <ul>
                  {books.map((book) => {
                    const isSelected = selectedBookIds.includes(book.bookId);
                    return (
                      <li className="flex items-start gap-3 border-t border-hairline py-3" key={book.bookId}>
                        <button
                          aria-label={`${book.title} ${isSelected ? "선택 해제" : "선택"}`}
                          aria-pressed={isSelected}
                          className="-mx-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
                          onClick={() => toggleBook(book.bookId)}
                          type="button"
                        >
                          {isSelected ? (
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-white"><CheckMark /></span>
                          ) : (
                            <span className="size-6 rounded-full border-2 border-border-strong" />
                          )}
                        </button>
                        <span className="w-12 shrink-0">
                          <BookCover alt="" fallbackTitle={book.title} radius="control" thumbnailUrl={book.coverUrl} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 type-body-small font-semibold">{book.title}</h3>
                          <p className="truncate text-xs leading-[1.125rem] text-text-secondary">{bookMeta(book)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          ) : null}

          {missed.length > 0 ? (
            <section aria-labelledby="photo-scan-missed" className="mt-4">
              <h2 className="flex min-h-12 items-center type-body font-semibold" id="photo-scan-missed">
                찾지 못했어요 <span className="ml-1.5 text-text-secondary">{missed.length}</span>
              </h2>
              <p className="mb-1 type-caption text-text-secondary">이 책들은 이번에 담기지 않아요.</p>
              <ul>
                {missed.map((item, index) => (
                  // AI 는 못 찾은 책에 번호를 주지 않는다. 결과 목록은 바뀌지 않아 순서로 구분한다
                  <li className="flex min-h-11 items-center border-t border-hairline type-caption" key={`${index}-${item.readText}`}>
                    <span className="truncate">{item.readText}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
        <div className="page-content shrink-0 border-t border-hairline bg-surface pb-5 pt-3">
          {saveError ? (
            <div className="pb-3">
              <Toast variant="error">{saveError}</Toast>
            </div>
          ) : null}
          {books.length > 0 ? (
            <div className="flex gap-2">
              <Button className="min-h-12 shrink-0" onClick={() => setIsCaptureOpen(true)} variant="secondary">다시 찍기</Button>
              <Button
                className="min-h-12 flex-1"
                disabled={selectedBookIds.length === 0}
                isLoading={isSaving}
                onClick={() => { void saveSelected(); }}
              >
                {selectedBookIds.length > 0 ? `${selectedBookIds.length}권 담기` : "담을 책을 골라 주세요"}
              </Button>
            </div>
          ) : (
            <Button className="min-h-12 w-full" onClick={() => setIsCaptureOpen(true)}>다시 찍기</Button>
          )}
        </div>
        {captureSheet}
      </div>
    );
  }

  const failure = step.kind === "failed" ? FAILURE_COPY[step.reason] : null;
  const canShowPhoto = !(step.kind === "failed" && step.reason === "unreadable");

  return (
    <div className="flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/library" showCart={false} title="책장 사진으로 담기" />
      <main className="page-content flex min-h-0 flex-1 flex-col overflow-y-auto py-5">
        <div className="relative h-65.5 shrink-0 overflow-hidden rounded-panel bg-muted">
          {canShowPhoto ? (
            <PhotoPreview
              alt="올린 책장 사진"
              className={`size-full object-cover ${failure ? "blur-xs" : ""}`}
              photo={photo}
            />
          ) : null}
          {step.kind === "scanning" ? (
            <span aria-hidden="true" className="photo-scan-line absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_14px_3px_rgb(217_95_115/0.55)]" />
          ) : null}
        </div>

        {step.kind === "scanning" ? (
          <div aria-live="polite" role="status">
            <h2 className="mt-6 type-heading">책등 제목을 읽고 있어요</h2>
            <p className="mt-1 type-body-small text-text-secondary">보통 20~30초 걸려요.</p>
            <ScanProgress phase={step.phase} />
          </div>
        ) : null}

        {failure ? (
          <div role="alert">
            <h2 className="mt-6 type-heading">{failure.title}</h2>
            <p className="mt-1 type-body-small text-text-secondary">{failure.description}</p>
            {failure.hasTips ? (
              <ul className="mt-5 flex flex-col gap-2 rounded-panel bg-muted px-4 py-3.5 type-body-small">
                {SHOT_TIPS.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {step.kind === "scanning" ? (
            <>
              <p className="rounded-panel bg-muted px-3.5 py-3 type-caption">이 화면을 나가면 찾기가 멈춰요. 다시 찍어야 해요.</p>
              <Button className="min-h-12 w-full" onClick={onExit} variant="secondary">나의 도서관으로 돌아가기</Button>
            </>
          ) : (
            <>
              <Button className="min-h-12 w-full" onClick={() => setIsCaptureOpen(true)}>다시 찍기</Button>
              {step.kind === "failed" && (step.reason === "timeout" || step.reason === "error") ? (
                <Button className="min-h-12 w-full" onClick={retry} variant="secondary">같은 사진으로 다시 시도</Button>
              ) : null}
            </>
          )}
        </div>
      </main>
      {captureSheet}
    </div>
  );
}
