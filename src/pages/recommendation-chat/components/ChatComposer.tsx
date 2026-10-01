import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/common/components/Button";
import type { ChatPresentationStatus } from "@/pages/recommendation-chat/types/chatPresentation";

const MAX_MESSAGE_LENGTH = 200;

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
  const isSending = status === "sending";
  // A failed message must succeed through retry first so recentTurns matches the visible transcript.
  const isLocked = status !== "idle";
  const canSend = draft.trim().length > 0 && !isLocked;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend || isComposingRef.current) {
      return;
    }

    onSend(draft.trim());
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" &&
      (isComposingRef.current || event.nativeEvent.isComposing)
    ) {
      event.preventDefault();
    }
  };

  return (
    <form
      className="page-content flex shrink-0 items-center gap-2 border-t border-border bg-surface py-3"
      onSubmit={handleSubmit}
    >
      <button
        aria-label="이미지 첨부"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface type-heading text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onAttachClick}
        type="button"
      >
        <span aria-hidden="true">+</span>
      </button>
      <label className="min-w-0 flex-1">
        <span className="sr-only">AI 추천 메시지</span>
        <input
          autoComplete="off"
          className="min-h-11 w-full rounded-control border border-border bg-surface px-3 type-body-small text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:bg-muted"
          disabled={isLocked}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onKeyDown={handleKeyDown}
          placeholder="예: 밤에 잠 안 올 때 읽기 좋은 에세이"
          type="text"
          value={draft}
        />
      </label>
      <Button
        className="shrink-0 px-4"
        disabled={!canSend}
        isLoading={isSending}
        type="submit"
      >
        전송
      </Button>
    </form>
  );
}
