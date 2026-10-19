import { useEffect, useRef } from "react";

import type { ChatSessionSummary } from "@/features/recommendation/types/recommendationChat";

interface ChatSessionListProps {
  activeSessionId: number | null;
  hasError: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onRetry: () => void;
  onSelect: (sessionId: number) => void;
  sessions: ChatSessionSummary[];
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "long",
});

export function ChatSessionList({ activeSessionId, hasError, isOpen, onClose, onNewSession, onRetry, onSelect, sessions }: ChatSessionListProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog aria-labelledby="chat-session-list-title" className="m-0 ml-auto h-dvh w-[min(85vw,22rem)] max-w-none border-0 bg-surface p-0 text-text-primary backdrop:bg-black/40" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialogRef}>
      <div className="flex h-full flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-hairline px-5"><h2 className="type-title" id="chat-session-list-title">이전 대화</h2><button aria-label="대화 목록 닫기" className="size-11 rounded-full type-heading" onClick={onClose} type="button">×</button></header>
        <div className="p-4"><button className="min-h-11 w-full rounded-control bg-primary px-4 type-body-small font-semibold text-white" onClick={() => { onNewSession(); onClose(); }} type="button">새 대화 시작</button></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {hasError ? <div className="rounded-panel bg-muted p-4"><p className="type-body-small text-error">대화 목록을 불러오지 못했어요</p><button className="mt-2 min-h-11 type-body-small font-semibold underline" onClick={onRetry} type="button">다시 불러오기</button></div> : null}
          {!hasError && sessions.length === 0 ? <p className="py-10 text-center type-body-small text-text-tertiary">저장된 대화가 없어요</p> : null}
          <ul className="divide-y divide-hairline">{sessions.map((session, index) => <li key={session.sessionId}><button aria-current={session.sessionId === activeSessionId ? "page" : undefined} className={`min-h-16 w-full px-2 text-left ${session.sessionId === activeSessionId ? "font-semibold text-accent" : "text-text-primary"}`} onClick={() => { onSelect(session.sessionId); onClose(); }} type="button"><span className="block type-body-small">대화 {sessions.length - index}</span><time className="mt-1 block type-caption font-normal text-text-tertiary" dateTime={session.createdAt}>{dateFormatter.format(new Date(session.createdAt))}</time></button></li>)}</ul>
        </div>
      </div>
    </dialog>
  );
}
