import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { MAX_CHAT_MESSAGE_LENGTH } from "@/pages/recommendation-chat/lib/chatMessage";
import type { ChatPresentationStatus } from "@/pages/recommendation-chat/types/chatPresentation";

interface ChatComposerProps {
  onAttachClick: () => void;
  onSend: (message: string) => void;
  status: ChatPresentationStatus;
}

export function ChatComposer({
  onAttachClick,
  onSend,
  status,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const isComposingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSending = status === "sending";
  const canSend = draft.trim().length > 0 && !isSending;

  // Grow with the draft up to the CSS max height, then scroll inside the field.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draft]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend || isComposingRef.current) {
      return;
    }

    onSend(draft.trim());
    setDraft("");
  };

  // Enter sends and Shift+Enter breaks the line; Enter that commits Korean IME input never sends.
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    if (isComposingRef.current || event.nativeEvent.isComposing) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form
      className="page-content flex shrink-0 items-end gap-2 border-t border-hairline bg-surface py-2.5"
      onSubmit={handleSubmit}
    >
      <button
        aria-label="이미지 첨부"
        className="mb-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full type-heading font-normal text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onAttachClick}
        type="button"
      >
        <span aria-hidden="true">+</span>
      </button>
      <div className="flex min-w-0 flex-1 items-end gap-1 rounded-3xl border border-transparent bg-muted py-1 pl-4 pr-1 transition-colors focus-within:border-primary focus-within:bg-surface">
        <label className="min-w-0 flex-1">
          <span className="sr-only">북적이에게 보낼 메시지</span>
          <textarea
            autoComplete="off"
            className="block max-h-30 w-full resize-none bg-transparent py-1.5 text-base leading-6 text-text-primary outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:text-text-disabled"
            disabled={isSending}
            enterKeyHint="send"
            maxLength={MAX_CHAT_MESSAGE_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onKeyDown={handleKeyDown}
            placeholder="어떤 책을 찾고 있나요?"
            ref={textareaRef}
            rows={1}
            value={draft}
          />
        </label>
        <button
          aria-busy={isSending || undefined}
          aria-label="전송"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-border-strong"
          disabled={!canSend}
          type="submit"
        >
          {isSending ? (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : (
            <svg aria-hidden="true" className="size-4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
