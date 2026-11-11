import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LibrarySheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// 나의 도서관 사진 담기에서 쓰는 하단 시트(사진 고르기·검색해서 담기). 내용이 길면 제목 아래만 스크롤된다
export function LibrarySheet({ children, isOpen, onClose, title }: LibrarySheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
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

  if (!shell) return null;

  return createPortal(
    <div className={isOpen ? "absolute inset-0 z-50" : "hidden"} ref={layerRef}>
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <dialog
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 top-auto m-0 max-h-[85%] w-full max-w-none flex-col rounded-t-panel border-0 bg-surface p-0 text-text-primary open:flex"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
        ref={dialogRef}
      >
        <div className="shrink-0 px-5 pt-3">
          <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="type-subheading" id={titleId}>{title}</h2>
            <button
              aria-label="닫기"
              className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-full type-heading focus-visible:outline-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
        <div className="safe-area-bottom min-h-0 flex-1 overflow-y-auto px-5">{children}</div>
      </dialog>
    </div>,
    shell,
  );
}
