import { useState } from "react";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { BookSearchSheet } from "@/features/library/components/BookSearchSheet";
import { PhotoCaptureSheet } from "@/features/library/components/PhotoCaptureSheet";
import { PhotoPreview } from "@/features/library/components/PhotoPreview";
import { PhotoScanSingleBook } from "@/features/library/components/PhotoScanSingleBook";
import {
  foundBooks,
  usePhotoScan,
  type PhotoScanFailureReason,
  type PhotoScanStep,
} from "@/features/library/hooks/usePhotoScan";
import { bookMeta } from "@/features/library/lib/bookMeta";
import type {
  PhotoScanResult,
  PhotoScanSaved,
  SaveScannedBooks,
  ScanPhoto,
  SearchBooks,
} from "@/features/library/types/photoScan";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

interface PhotoScanFlowProps {
  initialPhoto: File;
  onExit: () => void;
  onSaved: (saved: PhotoScanSaved) => void;
  saveBooks: SaveScannedBooks;
  scanPhoto: ScanPhoto;
  searchBooks: SearchBooks;
}

const SHOT_TIPS = [
  "책장은 한 칸만, 표지는 한 권만 화면에 가득 차게 찍어 주세요.",
  "빛이 글자에 반사되지 않게 각도를 바꿔 주세요.",
  "메신저로 받은 사진은 작아져서 잘 안 읽힐 수 있어요.",
];

const FAILURE_COPY: Record<PhotoScanFailureReason, { description: string; hasTips: boolean; title: string }> = {
  error: { description: "잠시 뒤에 다시 시도해 주세요.", hasTips: false, title: "책을 찾지 못했어요" },
  no_books: { description: "사진이 흐리거나 너무 멀리서 찍은 것 같아요.", hasTips: true, title: "책 글자를 읽지 못했어요" },
  timeout: { description: "책장은 한 칸씩 나눠 찍으면 더 빨라요.", hasTips: true, title: "시간이 너무 오래 걸렸어요" },
  too_large: { description: "다른 사진으로 다시 골라 주세요.", hasTips: false, title: "사진이 너무 커요" },
  unreadable: { description: "JPG나 PNG 사진으로 다시 골라 주세요.", hasTips: false, title: "이 사진은 열 수 없어요" },
};

// 표지 한 권이면 체크리스트 대신 그 책 하나만 크게 보여 준다
function isSingleCover(result: PhotoScanResult) {
  return result.photoType === "cover" && result.items.length === 1;
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
        책 제목을 읽는 중이에요
      </li>
      <li className="flex items-center gap-2.5 text-text-secondary">
        <span aria-hidden="true" className="size-5.5 shrink-0 rounded-full border-2 border-border-strong" />
        우리 서점 책과 맞춰 볼게요
      </li>
    </ol>
  );
}

export function PhotoScanFlow({ initialPhoto, onExit, onSaved, saveBooks, scanPhoto, searchBooks }: PhotoScanFlowProps) {
  const { chooseBook, isSaving, photo, retake, retry, saveError, saveSelected, selectedBookIds, step, toggleBook } =
    usePhotoScan({ initialPhoto, onSaved, saveBooks, scanPhoto });
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  // 검색해서 고를 사진 속 책의 자리(결과 items 의 index). 시트를 닫으면 null
  const [searchIndex, setSearchIndex] = useState<number | null>(null);
  const searchItem = step.kind === "result" && searchIndex !== null ? step.result.items[searchIndex] : undefined;

  const handleRetake = (file: File) => {
    setSearchIndex(null);
    retake(file);
  };

  const sheets = (
    <>
      <PhotoCaptureSheet isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} onPick={handleRetake} />
      {searchIndex !== null && searchItem ? (
        <BookSearchSheet
          hint="사진 속 책과 같은 책을 골라 주세요."
          initialQuery={searchItem.state === "FOUND" ? searchItem.book.title : searchItem.readText}
          key={searchIndex}
          onClose={() => setSearchIndex(null)}
          onPick={(book) => {
            setSearchIndex(null);
            chooseBook(searchIndex, book);
          }}
          searchBooks={searchBooks}
          title="검색해서 고르기"
        />
      ) : null}
    </>
  );

  if (step.kind === "result" && isSingleCover(step.result)) {
    return (
      <>
        <PhotoScanSingleBook
          isSaving={isSaving}
          item={step.result.items[0]}
          onRetake={() => setIsCaptureOpen(true)}
          onSave={() => { void saveSelected(); }}
          onSearch={() => setSearchIndex(0)}
          photo={photo}
          saveError={saveError}
          searchBooks={searchBooks}
        />
        {sheets}
      </>
    );
  }

  if (step.kind === "result") {
    const books = foundBooks(step.result);
    // 검색해서 고르면 그 자리의 책을 바꾸므로 원래 자리를 같이 둔다
    const missed = step.result.items.flatMap((item, index) => (item.state === "NOT_FOUND" ? [{ index, readText: item.readText }] : []));

    return (
      <div className="flex h-full flex-col bg-surface">
        <AppPageHeader fallbackPath="/my/library" showCart={false} title="찾은 책 확인" />
        <main className="page-content min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="flex items-center gap-3 pt-4">
            <PhotoPreview alt="올린 사진" className="h-13.5 w-18 shrink-0 rounded-control object-cover" photo={photo} />
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
                          aria-label={`${displayBookTitle(book.title)} ${isSelected ? "선택 해제" : "선택"}`}
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
                          <h3 className="line-clamp-2 type-body-small font-semibold">{displayBookTitle(book.title)}</h3>
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
              <p className="mb-1 type-caption text-text-secondary">검색해서 고르면 함께 담을 수 있어요.</p>
              <ul>
                {missed.map(({ index, readText }) => (
                  // AI 는 못 찾은 책에 번호를 주지 않는다. 결과 목록의 자리로 구분한다
                  <li className="flex min-h-11 items-center gap-2 border-t border-hairline type-caption" key={`${index}-${readText}`}>
                    <span className="min-w-0 flex-1 truncate">{readText}</span>
                    <button
                      aria-label={`${readText} 검색해서 담기`}
                      className="-mr-2 inline-flex min-h-11 shrink-0 items-center px-2 font-semibold text-accent focus-visible:outline-2 focus-visible:outline-primary"
                      onClick={() => setSearchIndex(index)}
                      type="button"
                    >
                      검색해서 담기
                    </button>
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
        {sheets}
      </div>
    );
  }

  const failure = step.kind === "failed" ? FAILURE_COPY[step.reason] : null;
  const canShowPhoto = !(step.kind === "failed" && step.reason === "unreadable");

  return (
    <div className="flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/library" showCart={false} title="사진으로 담기" />
      <main className="page-content flex min-h-0 flex-1 flex-col overflow-y-auto py-5">
        <div className="relative h-65.5 shrink-0 overflow-hidden rounded-panel bg-muted">
          {canShowPhoto ? (
            <PhotoPreview
              alt="올린 사진"
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
            <h2 className="mt-6 type-heading">책 제목을 읽고 있어요</h2>
            <p className="mt-1 type-body-small text-text-secondary">보통 10~30초 걸려요.</p>
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
      {sheets}
    </div>
  );
}
