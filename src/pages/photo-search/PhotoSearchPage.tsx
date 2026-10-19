import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeftIcon, CameraIcon } from "@/common/components/AppIcons";
import { BookCover } from "@/common/components/BookCover";
import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { addMockLibraryBook } from "@/features/library/mock/mockLibraryRepository";

type Mode = "sheet" | "camera" | "analyzing" | "result";

export function PhotoSearchPage() {
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const analysisTimerRef = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>("sheet");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(
    () => () => {
      if (analysisTimerRef.current !== null) {
        window.clearTimeout(analysisTimerRef.current);
      }
    },
    [],
  );

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("이미지 파일을 선택해 주세요.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (analysisTimerRef.current !== null) {
      window.clearTimeout(analysisTimerRef.current);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setMode("analyzing");
    analysisTimerRef.current = window.setTimeout(() => {
      setMode("result");
      analysisTimerRef.current = null;
    }, 900);
  };

  const handleAddToLibrary = () => {
    addMockLibraryBook({
      author: "김초엽",
      id: "scan-result",
      productId: 1,
      thumbnailUrl: null,
      title: "우리가 빛의 속도로 갈 수 없다면",
    });
    setNotice("나의 도서관에 담았어요.");
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#181818] text-white">
      <input
        accept="image/*"
        aria-label="카메라로 책 사진 촬영"
        capture="environment"
        className="sr-only"
        onChange={handleImageSelect}
        ref={cameraRef}
        type="file"
      />
      <input
        accept="image/*"
        aria-label="사진 보관함에서 책 사진 선택"
        className="sr-only"
        onChange={handleImageSelect}
        ref={galleryRef}
        type="file"
      />

      {mode === "sheet" ? (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-surface text-text-primary">
            <header className="page-content grid min-h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-hairline">
              <ArrowLeftIcon className="size-6" />
              <strong className="text-center type-title">AI 추천</strong>
              <span />
            </header>
            <main className="page-content space-y-4 py-6">
              <div className="max-w-[82%] rounded-panel rounded-tl-none bg-muted p-4 type-body-small">
                어떤 책을 찾고 계세요? 책 표지나 책장 사진을 보여주셔도 좋아요.
              </div>
              <div className="ml-auto max-w-[72%] rounded-panel rounded-tr-none bg-primary p-4 type-body-small text-white">
                사진으로 찾아볼게요.
              </div>
            </main>
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
          <section
            aria-labelledby="photo-source-title"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-text-primary"
            role="dialog"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />
            <h1 className="type-title" id="photo-source-title">
              사진을 어디서 가져올까요?
            </h1>
            <button
              className="mt-4 flex min-h-14 w-full items-center gap-3 border-b border-hairline text-left type-body font-semibold focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => setMode("camera")}
              type="button"
            >
              <CameraIcon className="size-6" />카메라로 촬영
            </button>
            <button
              className="flex min-h-14 w-full items-center gap-3 border-b border-hairline text-left type-body font-semibold focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => galleryRef.current?.click()}
              type="button"
            >
              <span aria-hidden="true" className="text-xl">▣</span>
              사진 보관함에서 선택
            </button>
            <button
              className="mt-2 min-h-12 w-full type-body text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => navigate(-1)}
              type="button"
            >
              취소
            </button>
          </section>
        </>
      ) : null}

      {mode === "camera" ? (
        <>
          <header className="page-content flex min-h-16 items-center">
            <button
              aria-label="닫기"
              className="inline-flex size-11 items-center justify-center text-2xl focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setMode("sheet")}
              type="button"
            >
              ×
            </button>
            <h1 className="flex-1 text-center type-title">책을 프레임 안에 맞춰주세요</h1>
            <span className="size-11" />
          </header>
          <main className="relative flex flex-1 items-center justify-center bg-black">
            <div className="aspect-[3/4] w-[72%] rounded-panel border-2 border-white/80">
              <span className="sr-only">카메라 촬영 가이드</span>
            </div>
            <p className="absolute bottom-6 type-caption text-white/80">
              빛 반사를 피해 책 제목이 보이게 찍어주세요.
            </p>
          </main>
          <footer className="grid min-h-28 grid-cols-3 items-center px-8">
            <button
              aria-label="사진 보관함"
              className="justify-self-start text-2xl focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => galleryRef.current?.click()}
              type="button"
            >
              ▣
            </button>
            <button
              aria-label="사진 촬영"
              className="size-16 justify-self-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => cameraRef.current?.click()}
              type="button"
            >
              <img
                alt=""
                className="size-full"
                src={`${import.meta.env.BASE_URL}assets/search-camera-shutter.svg`}
              />
            </button>
            <span />
          </footer>
        </>
      ) : null}

      {mode === "analyzing" || mode === "result" ? (
        <>
          <header className="page-content flex min-h-16 items-center border-b border-white/10">
            <button
              aria-label="뒤로 가기"
              className="inline-flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setMode("sheet")}
              type="button"
            >
              <ArrowLeftIcon className="size-6" />
            </button>
            <h1 className="flex-1 text-center type-title">검색 결과</h1>
            <span className="size-11" />
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto bg-surface p-5 text-text-primary">
            {previewUrl ? (
              <img
                alt="선택한 검색 사진"
                className="h-44 w-full rounded-panel object-cover"
                src={previewUrl}
              />
            ) : null}
            {mode === "analyzing" ? (
              <div aria-busy="true" className="flex min-h-52 flex-col items-center justify-center">
                <span className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="mt-4 type-body">사진 속 책을 찾고 있어요...</p>
              </div>
            ) : (
              <section className="mt-5 rounded-panel border border-border p-4">
                <p className="type-caption font-semibold text-accent">가장 비슷한 책</p>
                <div className="mt-3 flex gap-3">
                  <div className="w-20 shrink-0">
                    <BookCover alt="" fallbackTitle="우리가 빛의 속도로 갈 수 없다면" thumbnailUrl={null} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="type-title">우리가 빛의 속도로 갈 수 없다면</h2>
                    <p className="mt-1 type-body-small text-text-secondary">김초엽</p>
                    <Button className="mt-4" onClick={handleAddToLibrary}>
                      나의 도서관에 담기
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </>
      ) : null}

      {notice ? (
        <div className="page-content absolute inset-x-0 bottom-5 z-20 text-text-primary">
          <Toast>{notice}</Toast>
        </div>
      ) : null}
    </div>
  );
}
