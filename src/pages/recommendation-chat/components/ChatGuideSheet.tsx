import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CHAT_EXAMPLE_CHIP_CLASS_NAME, ChatGuideTopicIcon } from "@/pages/recommendation-chat/components/ChatGuideTopics";
import { CHAT_GUIDE_TOPICS, quoteExamples } from "@/pages/recommendation-chat/lib/chatGuide";

interface ChatGuideSheetProps {
  // While a reply is still coming the chat ignores new messages, so the examples are disabled.
  canSend: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (question: string) => void;
}

// Downward drag distance (px) that closes the sheet on release.
const SWIPE_CLOSE_THRESHOLD = 80;

// The guidebook opened from the header icon: the same topics as the "뭘 할 수 있어?" answer, reachable at any point in
// the chat. Opens the way ChatSessionList does: inside the app shell, with the rest of the shell made inert.
export function ChatGuideSheet({ canSend, isOpen, onClose, onSelect }: ChatGuideSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const titleId = useId();
  const shell = document.getElementById("app-shell");

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

  const resetDrag = () => {
    dragStartY.current = null;
    setDragOffset(0);
  };

  return createPortal(
    <div className={isOpen ? "absolute inset-0 z-50" : "hidden"} ref={layerRef}>
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <dialog
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 top-auto m-0 flex max-h-[92%] w-full max-w-none flex-col rounded-t-panel border-0 bg-surface p-0 text-text-primary ${
          dragOffset === 0 ? "motion-safe:transition-transform motion-safe:duration-200" : ""
        }`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
        ref={dialogRef}
        style={{ transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined }}
      >
        <div
          className="shrink-0 touch-none px-5"
          onTouchCancel={resetDrag}
          onTouchEnd={() => {
            const shouldClose = dragOffset > SWIPE_CLOSE_THRESHOLD;
            resetDrag();
            if (shouldClose) onClose();
          }}
          onTouchMove={(event) => {
            const touchY = event.touches[0]?.clientY;
            if (dragStartY.current !== null && touchY !== undefined) setDragOffset(Math.max(0, touchY - dragStartY.current));
          }}
          onTouchStart={(event) => {
            dragStartY.current = event.touches[0]?.clientY ?? null;
          }}
        >
          <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-border-strong" />
          <header className="flex min-h-12 items-center justify-between gap-2">
            <h2 className="type-subheading" id={titleId}>북적이 가이드북</h2>
            <button
              aria-label="가이드북 닫기"
              className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-full type-heading text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </header>
          <p className="type-caption text-text-secondary">
            {canSend ? "예시를 누르면 그대로 보내져요." : "답을 다 받으면 예시를 보낼 수 있어요."}
          </p>
        </div>

        <div className="safe-area-bottom min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="flex flex-col gap-4.5">
            {CHAT_GUIDE_TOPICS.map((topic) => (
              <section aria-labelledby={`${titleId}-${topic.id}`} key={topic.id}>
                <div className="flex items-start gap-2.5">
                  <ChatGuideTopicIcon topic={topic} />
                  <div className="min-w-0">
                    <h3 className="type-body font-semibold text-text-primary" id={`${titleId}-${topic.id}`}>
                      {topic.title}
                    </h3>
                    <p className="type-caption text-text-secondary">{topic.description}</p>
                  </div>
                </div>
                {topic.kind === "questions" ? (
                  <ul aria-label={topic.title} className="ml-10.5 mt-2.5 flex flex-wrap gap-2">
                    {topic.questions.map((question) => (
                      <li key={question}>
                        <button
                          className={CHAT_EXAMPLE_CHIP_CLASS_NAME}
                          disabled={!canSend}
                          onClick={() => onSelect(question)}
                          type="button"
                        >
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <dl className="ml-10.5 mt-2.5 flex flex-col gap-1.5">
                    {topic.tips.map((tip) => (
                      <div className="flex items-baseline gap-2.5 rounded-control bg-muted px-3 py-2" key={tip.label}>
                        <dt className="w-16 shrink-0 type-caption text-text-secondary">{tip.label}</dt>
                        <dd className="type-body-small text-text-primary">{quoteExamples(tip.examples)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ))}
          </div>
        </div>
      </dialog>
    </div>,
    shell,
  );
}
