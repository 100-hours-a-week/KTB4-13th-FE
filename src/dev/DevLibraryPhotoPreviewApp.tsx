import { useState } from "react";
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import { BottomNavigationLayout } from "@/app/layouts/BottomNavigationLayout";
import { CameraIcon } from "@/common/components/AppIcons";
import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { libraryPreviewBooks, photoScanPreviewCases, type PhotoScanPreviewCase } from "@/dev/fixtures/photoScan";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/authContext";
import { PhotoCaptureSheet } from "@/features/library/components/PhotoCaptureSheet";
import { PhotoScanEntryCard } from "@/features/library/components/PhotoScanEntryCard";
import { PhotoScanFlow } from "@/features/library/components/PhotoScanFlow";
import { PhotoScanSavedBanner } from "@/features/library/components/PhotoScanSavedBanner";
import { foundBooks, type PhotoScanSaved } from "@/features/library/hooks/usePhotoScan";
import type { SaveScannedBooks, ScanPhoto } from "@/features/library/types/photoScan";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

const UPLOAD_DELAY_MS = 800;
const RECOGNIZE_DELAY_MS = 2000;

const previewAuth: AuthContextValue = {
  accessToken: null,
  clearAccessToken: () => {},
  setAccessToken: () => {},
  status: "authenticated",
};

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

interface PreviewProps {
  previewCase: PhotoScanPreviewCase;
  setPreviewCase: (previewCase: PhotoScanPreviewCase) => void;
}

// 실제 LibraryPage 대신 쓰는 미리보기용 도서관. 연동 PR 에서 입구·배너를 LibraryPage 에 넣는다
function LibraryPreview({ previewCase, setPreviewCase }: PreviewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const saved = (location.state as { saved?: PhotoScanSaved } | null)?.saved ?? null;
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const { result } = photoScanPreviewCases[previewCase];
  const savedBooks = saved && result !== "timeout" ? foundBooks(result).slice(0, saved.savedCount) : [];
  const isEmpty = photoScanPreviewCases[previewCase].isLibraryEmpty;
  const books = [
    ...savedBooks.map((book) => ({ author: book.author, coverUrl: book.coverUrl, title: book.title })),
    // 미리보기 도서관에 이미 있는 책은 두 번 넣지 않는다
    ...(isEmpty ? [] : libraryPreviewBooks.filter((book) => !savedBooks.some((saved) => saved.title === book.title))),
  ];

  return (
    <div className="relative flex h-full flex-col bg-surface">
      <AppPageHeader action={<span />} fallbackPath="/my" title="나의 도서관" />
      <main className="min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="page-content flex min-h-14 items-center">
          <strong className="type-body">담아둔 책 {books.length}</strong>
        </div>
        {books.length > 0 ? (
          <>
            <div className="page-content pb-5">
              {saved ? <PhotoScanSavedBanner {...saved} /> : <PhotoScanEntryCard onClick={() => setIsCaptureOpen(true)} />}
            </div>
            <ul className="page-content grid grid-cols-3 gap-x-3 gap-y-6">
              {books.map((book, index) => (
                <li key={`${index}-${book.title}`}>
                  <BookCover alt="" fallbackTitle={book.title} thumbnailUrl={book.coverUrl} />
                  <h2 className="mt-2 line-clamp-2 type-caption font-semibold text-text-primary">{book.title}</h2>
                  <p className="mt-0.5 truncate text-[0.7rem] text-text-tertiary">{book.author}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <section className="page-content flex min-h-96 flex-col items-center justify-center text-center">
            <span className="inline-flex size-18 items-center justify-center rounded-full bg-muted text-primary">
              <CameraIcon aria-hidden="true" className="size-8" />
            </span>
            <h2 className="mt-4 type-title">아직 담아둔 책이 없어요</h2>
            <p className="mt-2 type-body-small text-text-secondary">집에 있는 책장을 찍으면 한 번에 담을 수 있어요.</p>
            <Button className="mt-5 px-5" onClick={() => setIsCaptureOpen(true)}>책장 사진으로 담기</Button>
            <Button className="mt-2 px-5" variant="secondary">AI 추천 열기</Button>
          </section>
        )}

        <fieldset className="page-content mt-8">
          <legend className="type-caption text-text-tertiary">개발 전용 · 인식 결과 고르기 (실제 요청 없음)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(photoScanPreviewCases) as PhotoScanPreviewCase[]).map((caseKey) => (
              <button
                aria-pressed={previewCase === caseKey}
                className={`min-h-9 rounded-control border px-3 type-caption font-semibold ${
                  previewCase === caseKey ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-primary"
                }`}
                key={caseKey}
                onClick={() => {
                  setPreviewCase(caseKey);
                  navigate("/my/library", { replace: true });
                }}
                type="button"
              >
                {photoScanPreviewCases[caseKey].label}
              </button>
            ))}
          </div>
        </fieldset>
      </main>
      {saved ? (
        <div className="page-content shrink-0 border-t border-hairline py-2.5">
          <Button className="w-full" onClick={() => setIsCaptureOpen(true)} variant="secondary">
            <CameraIcon aria-hidden="true" className="size-5" />
            다른 칸도 찍기
          </Button>
        </div>
      ) : null}
      <PhotoCaptureSheet
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onPick={(photo) => navigate("/my/library/photo", { state: { photo } })}
      />
    </div>
  );
}

function PhotoScanPreview({ previewCase }: Pick<PreviewProps, "previewCase">) {
  const navigate = useNavigate();
  const location = useLocation();
  const photo = (location.state as { photo?: File } | null)?.photo;
  const { result, saveFails } = photoScanPreviewCases[previewCase];

  const scanPhoto: ScanPhoto = async (_photo, { onPhase, signal }) => {
    onPhase("uploading");
    await wait(UPLOAD_DELAY_MS, signal);
    onPhase("recognizing");
    await wait(RECOGNIZE_DELAY_MS, signal);
    return result === "timeout" ? { ok: false, reason: "timeout" } : { data: result, ok: true };
  };

  const saveBooks: SaveScannedBooks = async () => {
    await wait(UPLOAD_DELAY_MS);
    return saveFails ? { ok: false } : { ok: true };
  };

  if (!photo) return <Navigate replace to="/my/library" />;

  return (
    <PhotoScanFlow
      initialPhoto={photo}
      onExit={() => navigate("/my/library", { replace: true })}
      onSaved={(saved) => navigate("/my/library", { replace: true, state: { saved } })}
      saveBooks={saveBooks}
      scanPhoto={scanPhoto}
    />
  );
}

export default function DevLibraryPhotoPreviewApp() {
  const [previewCase, setPreviewCase] = useState<PhotoScanPreviewCase>("shelf");

  return (
    <AuthContext.Provider value={previewAuth}>
      <MemoryRouter initialEntries={["/my/library"]}>
        <AppLayout>
          <Routes>
            <Route element={<BottomNavigationLayout />}>
              <Route element={<LibraryPreview previewCase={previewCase} setPreviewCase={setPreviewCase} />} path="/my/library" />
              <Route element={<Navigate replace to="/my/library" />} path="*" />
            </Route>
            <Route
              element={<div className="h-dvh"><PhotoScanPreview previewCase={previewCase} /></div>}
              path="/my/library/photo"
            />
          </Routes>
        </AppLayout>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
