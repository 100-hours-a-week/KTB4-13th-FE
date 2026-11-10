import { useEffect, useRef, type ChangeEvent } from "react";
import { createPortal } from "react-dom";

import { CameraIcon } from "@/common/components/AppIcons";
import { Button } from "@/common/components/Button";
// CNU HMLAB book-spine-dataset-library (CC BY 4.0) 의 책장 사진
import shelfPhotoExample from "@/features/library/assets/shelf-photo-example.jpg";

interface PhotoCaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (photo: File) => void;
}

export function PhotoCaptureSheet({ isOpen, onClose, onPick }: PhotoCaptureSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const albumInput = useRef<HTMLInputElement>(null);
  const shell = document.getElementById("app-shell");

  // ChatSessionList 와 같은 방식: showModal() 은 화면 전체 top layer 에 뜨므로 앱 화면 안에서 열고 나머지를 inert 로 막는다
  useEffect(() => {
    const dialog = dialogRef.current;
    const layer = layerRef.current;
    if (!isOpen || !dialog || !layer?.parentElement) return;
    const returnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = [...layer.parentElement.children].filter((element) => element !== layer);
    background.forEach((element) => element.setAttribute("inert", ""));
    dialog.show();
    return () => {
      dialog.close();
      background.forEach((element) => element.removeAttribute("inert"));
      returnFocusTarget?.focus();
    };
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 오도록 비운다
    event.target.value = "";
    if (!file) return;
    onClose();
    onPick(file);
  };

  if (!shell) return null;

  return createPortal(
    <div className={isOpen ? "absolute inset-0 z-50" : "hidden"} ref={layerRef}>
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <dialog
        aria-labelledby="photo-capture-title"
        className="absolute inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-panel border-0 bg-surface p-0 text-text-primary"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
        ref={dialogRef}
      >
        <div className="safe-area-bottom px-5 pt-3">
          <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="type-subheading" id="photo-capture-title">책장 사진으로 담기</h2>
            <button
              aria-label="닫기"
              className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-full type-heading focus-visible:outline-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
          <p className="mt-1 type-body-small text-text-secondary">책등 제목을 읽어서 우리 서점의 책과 맞춰 드려요.</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <figure>
              <img
                alt="책등 글자가 또렷하게 보이는 책장 사진"
                className="h-31 w-full rounded-control bg-muted object-cover"
                src={shelfPhotoExample}
              />
              <figcaption className="mt-2 type-caption font-semibold text-success">✓ 한 칸을 가까이</figcaption>
            </figure>
            <figure>
              <img
                alt="멀리서 찍어 글자가 흐린 책장 사진"
                className="h-31 w-full rounded-control bg-muted object-contain blur-[1.6px]"
                src={shelfPhotoExample}
              />
              <figcaption className="mt-2 type-caption font-semibold text-error">✕ 멀리서 한 번에</figcaption>
            </figure>
          </div>

          <ul className="mt-4 space-y-1.5 type-body-small">
            <li>책등 글자가 보이게 정면에서 찍어 주세요.</li>
            <li>책이 많으면 칸마다 나눠서 찍어 주세요.</li>
          </ul>

          <div className="mt-5 flex flex-col gap-2">
            <Button className="min-h-12 w-full" onClick={() => cameraInput.current?.click()}>
              <CameraIcon aria-hidden="true" className="size-5" />
              사진 찍기
            </Button>
            <Button className="min-h-12 w-full" onClick={() => albumInput.current?.click()} variant="secondary">
              앨범에서 고르기
            </Button>
          </div>
          <p className="mt-3.5 text-center text-xs leading-[1.125rem] text-text-secondary">
            사진 속 글자를 읽기 위해 사진을 외부 AI 서비스로 보내요.
          </p>
        </div>
        <input accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} ref={cameraInput} type="file" />
        <input accept="image/*" className="hidden" onChange={handleFileChange} ref={albumInput} type="file" />
      </dialog>
    </div>,
    shell,
  );
}
