import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import type { ChatSessionSummary } from "@/features/recommendation/types/recommendationChat";

interface ChatSessionListProps {
  activeSessionId: number | null;
  hasError: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onRetry: () => void;
  onSelect: (sessionId: number) => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  sessions: ChatSessionSummary[];
}

// Downward drag distance (px) that closes the sheet on release.
const SWIPE_CLOSE_THRESHOLD = 80;

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "long",
});

export function ChatSessionList({ activeSessionId, hasError, isOpen, onClose, onNewSession, onRetry, onSelect, returnFocusRef, sessions }: ChatSessionListProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const shell = document.getElementById("app-shell");

  // showModal() would place the panel in the viewport-wide top layer, so it opens non-modally inside
  // the app shell and makes the rest of the shell inert to keep modal clicks and focus behavior.
  useEffect(() => {
    const dialog = dialogRef.current;
    const layer = layerRef.current;
    if (!isOpen || !dialog || !layer?.parentElement) return;
    const returnFocusTarget = returnFocusRef.current;
    const background = [...layer.parentElement.children].filter((element) => element !== layer);
    background.forEach((element) => element.setAttribute("inert", ""));
    dialog.show();
    return () => {
      dialog.close();
      background.forEach((element) => element.removeAttribute("inert"));
      returnFocusTarget?.focus();
    };
  }, [isOpen, returnFocusRef]);

  if (!shell) return null;

  return createPortal(
    <div className={isOpen ? "absolute inset-0 z-50" : "hidden"} ref={layerRef}>
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <dialog aria-labelledby="chat-session-list-title" className={`absolute inset-x-0 bottom-0 top-auto m-0 flex max-h-[90%] w-full max-w-none flex-col rounded-t-panel border-0 bg-surface p-0 text-text-primary ${dragOffset === 0 ? "motion-safe:transition-transform motion-safe:duration-200" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }} ref={dialogRef} style={{ transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined }}>
        <div className="flex min-h-0 flex-col">
          <div className="shrink-0 touch-none" onTouchCancel={() => { dragStartY.current = null; setDragOffset(0); }} onTouchEnd={() => { const shouldClose = dragOffset > SWIPE_CLOSE_THRESHOLD; dragStartY.current = null; setDragOffset(0); if (shouldClose) onClose(); }} onTouchMove={(event) => { const touchY = event.touches[0]?.clientY; if (dragStartY.current !== null && touchY !== undefined) setDragOffset(Math.max(0, touchY - dragStartY.current)); }} onTouchStart={(event) => { dragStartY.current = event.touches[0]?.clientY ?? null; }}>
            <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong" />
            <header className="flex min-h-14 items-center justify-between border-b border-hairline pl-5 pr-3"><h2 className="type-title" id="chat-session-list-title">이전 대화</h2><button aria-label="대화 목록 닫기" className="size-11 rounded-full type-heading" onClick={onClose} type="button">×</button></header>
          </div>
          <div className="shrink-0 p-4"><button className="min-h-11 w-full rounded-control bg-primary px-4 type-body-small font-semibold text-white" onClick={() => { onNewSession(); onClose(); }} type="button">새 대화 시작</button></div>
          <div className="safe-area-bottom min-h-0 flex-1 overflow-y-auto px-4">
            {hasError ? <div className="rounded-panel bg-muted p-4"><p className="type-body-small text-error">대화 목록을 불러오지 못했어요</p><button className="mt-2 min-h-11 type-body-small font-semibold underline" onClick={onRetry} type="button">다시 불러오기</button></div> : null}
            {!hasError && sessions.length === 0 ? <p className="py-10 text-center type-body-small text-text-tertiary">저장된 대화가 없어요</p> : null}
            <ul className="divide-y divide-hairline">{sessions.map((session, index) => <li key={session.sessionId}><button aria-current={session.sessionId === activeSessionId ? "page" : undefined} className={`min-h-16 w-full px-2 text-left ${session.sessionId === activeSessionId ? "font-semibold text-accent" : "text-text-primary"}`} onClick={() => { onSelect(session.sessionId); onClose(); }} type="button"><span className="block type-body-small">대화 {sessions.length - index}</span><time className="mt-1 block type-caption font-normal text-text-tertiary" dateTime={session.createdAt}>{dateFormatter.format(new Date(session.createdAt))}</time></button></li>)}</ul>
          </div>
        </div>
      </dialog>
    </div>,
    shell,
  );
}
