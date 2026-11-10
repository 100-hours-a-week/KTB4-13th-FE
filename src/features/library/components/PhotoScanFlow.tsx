import { useRef, type ChangeEvent } from "react";

import { CameraIcon } from "@/common/components/AppIcons";
import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { foundBooks, usePhotoScan } from "@/features/library/hooks/usePhotoScan";
import type { PhotoScanBook, SaveScannedBooks, ScanPhoto } from "@/features/library/types/photoScan";

interface PhotoScanFlowProps {
  onSaved: (count: number) => void;
  saveBooks: SaveScannedBooks;
  scanPhoto: ScanPhoto;
}

const FAILURE_COPY = {
  error: { description: "잠시 뒤에 다시 시도해 주세요.", title: "책을 찾지 못했어요" },
  no_books: { description: "책 글씨가 잘 보이게 가까이 찍어 주세요.", title: "사진에서 책을 찾지 못했어요" },
  timeout: { description: "책장은 한 칸씩 나눠 찍으면 더 빨라요.", title: "시간이 너무 오래 걸렸어요" },
};

function bookMeta(book: PhotoScanBook) {
  return [book.author, book.publisher, book.year].filter(Boolean).join(" · ");
}

export function PhotoScanFlow({ onSaved, saveBooks, scanPhoto }: PhotoScanFlowProps) {
  const {
    choosePhoto,
    isSaving,
    photoUrl,
    reset,
    saveError,
    saveSelected,
    selectedIsbns,
    startScan,
    step,
    toggleBook,
  } = usePhotoScan({ onSaved, saveBooks, scanPhoto });
  const cameraInput = useRef<HTMLInputElement>(null);
  const albumInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 오도록 비운다
    event.target.value = "";
    if (file) choosePhoto(file);
  };

  const photo = photoUrl ? (
    <div className="relative h-64 overflow-hidden rounded-panel bg-muted">
      <img alt="고른 사진" className="size-full object-cover" src={photoUrl} />
      {step.kind === "scanning" ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-accent motion-reduce:animate-none"
        />
      ) : null}
    </div>
  ) : null;

  if (step.kind === "result") {
    const books = foundBooks(step.result);
    const missed = step.result.items.filter((item) => item.state === "NOT_FOUND");

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="page-content flex items-center gap-3 pt-4">
            {photoUrl ? (
              <img alt="고른 사진" className="h-14 w-18 shrink-0 rounded-control object-cover" src={photoUrl} />
            ) : null}
            <div>
              <p className="type-title">책 {step.result.items.length}권을 읽었어요</p>
              <p className="type-caption text-text-secondary">
                찾은 책 {books.length} · 못 찾음 {missed.length}
              </p>
            </div>
          </div>

          {books.length > 0 ? (
            <section aria-labelledby="photo-scan-found" className="page-content mt-4">
              <h2 className="type-body font-semibold" id="photo-scan-found">
                찾은 책 <span className="text-text-secondary">{books.length}</span>
              </h2>
              <p className="mt-1 type-caption text-text-secondary">제목이 사진 속 책과 다르면 체크를 풀어 주세요.</p>
              <ul className="mt-2">
                {books.map((book) => (
                  <li className="border-t border-hairline first:border-t-0" key={book.isbn}>
                    <label className="flex cursor-pointer items-center gap-3 py-3">
                      <input
                        checked={selectedIsbns.includes(book.isbn)}
                        className="size-5 shrink-0 accent-accent"
                        onChange={() => toggleBook(book.isbn)}
                        type="checkbox"
                      />
                      <span className="w-12 shrink-0">
                        <BookCover alt="" fallbackTitle={book.title} radius="control" thumbnailUrl={book.coverUrl} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 type-body-small font-semibold text-text-primary">{book.title}</span>
                        <span className="block truncate type-caption text-text-secondary">{bookMeta(book)}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {missed.length > 0 ? (
            <section aria-labelledby="photo-scan-missed" className="page-content mt-6">
              <h2 className="type-body font-semibold" id="photo-scan-missed">
                찾지 못했어요 <span className="text-text-secondary">{missed.length}</span>
              </h2>
              <p className="mt-1 type-caption text-text-secondary">
                사진에서 읽은 글자예요. 이 책들은 이번에 담기지 않아요.
              </p>
              <ul className="mt-2">
                {missed.map((item, index) => (
                  // AI 는 못 찾은 책에 번호를 주지 않는다. 결과 목록은 바뀌지 않아 순서로 구분한다
                  <li className="flex min-h-11 items-center border-t border-hairline type-body-small first:border-t-0" key={`${index}-${item.readText}`}>
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
            <Button
              className="w-full"
              disabled={selectedIsbns.length === 0}
              isLoading={isSaving}
              onClick={() => { void saveSelected(); }}
            >
              {selectedIsbns.length > 0 ? `선택한 책 ${selectedIsbns.length}권 담기` : "담을 책을 골라 주세요"}
            </Button>
          ) : (
            <Button className="w-full" onClick={reset}>다른 사진으로 다시 시도</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {step.kind === "pick" ? (
          <>
            <h2 className="type-heading">표지나 책장을 찍어 주세요</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 type-body-small text-text-secondary">
              <li>책장은 한 칸씩, 책등 글씨가 보이게 가까이 찍어 주세요.</li>
              <li>표지는 한 권이 화면에 가득 차게 찍어 주세요.</li>
              <li>사진 속 글자를 읽으려고 사진을 외부 AI 서비스로 보내요.</li>
            </ul>
            {step.notice ? (
              <div className="mt-4">
                <Toast variant="error">{step.notice}</Toast>
              </div>
            ) : null}
          </>
        ) : (
          photo
        )}

        {step.kind === "ready" ? (
          <p className="mt-4 type-body-small text-text-secondary">이 사진에서 책을 찾을까요?</p>
        ) : null}

        {step.kind === "scanning" ? (
          <div aria-live="polite" className="mt-6" role="status">
            <h2 className="type-heading">
              {step.phase === "recognizing" ? "사진 속 책을 찾고 있어요" : "사진을 올리고 있어요"}
            </h2>
            <p className="mt-1 type-body-small text-text-secondary">
              표지는 몇 초, 책장은 30초쯤 걸려요. 이 화면을 나가면 다시 찍어야 해요.
            </p>
          </div>
        ) : null}

        {step.kind === "failed" ? (
          <div className="mt-6" role="alert">
            <h2 className="type-heading">{FAILURE_COPY[step.reason].title}</h2>
            <p className="mt-1 type-body-small text-text-secondary">{FAILURE_COPY[step.reason].description}</p>
          </div>
        ) : null}
      </main>

      <div className="page-content flex shrink-0 flex-col gap-2 border-t border-hairline bg-surface pb-5 pt-3">
        {step.kind === "pick" ? (
          <>
            <Button className="w-full" onClick={() => cameraInput.current?.click()}>
              <CameraIcon aria-hidden="true" className="size-5" />
              사진 찍기
            </Button>
            <Button className="w-full" onClick={() => albumInput.current?.click()} variant="secondary">
              앨범에서 고르기
            </Button>
          </>
        ) : null}
        {step.kind === "ready" ? (
          <>
            <Button className="w-full" onClick={() => { void startScan(); }}>책 찾기</Button>
            <Button className="w-full" onClick={reset} variant="secondary">다른 사진 고르기</Button>
          </>
        ) : null}
        {step.kind === "scanning" ? (
          <Button className="w-full" disabled isLoading>
            {step.phase === "recognizing" ? "책 찾는 중" : "사진 올리는 중"}
          </Button>
        ) : null}
        {step.kind === "failed" ? (
          <>
            <Button className="w-full" onClick={reset}>다른 사진으로 다시 시도</Button>
            {step.reason !== "no_books" ? (
              <Button className="w-full" onClick={() => { void startScan(); }} variant="secondary">
                같은 사진으로 다시 시도
              </Button>
            ) : null}
          </>
        ) : null}
      </div>

      <input accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} ref={cameraInput} type="file" />
      <input accept="image/*" className="hidden" onChange={handleFileChange} ref={albumInput} type="file" />
    </div>
  );
}
