import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { CartButton } from "@/features/cart/components/CartButton";
import { ASSISTANT_NAME, AssistantAvatar } from "@/pages/recommendation-chat/components/AssistantAvatar";

interface ChatHeaderProps {
  onBack: () => void;
  onCartClick: () => void;
  onSessionListClick: () => void;
}

export function ChatHeader({ onBack, onCartClick, onSessionListClick }: ChatHeaderProps) {
  const iconButtonClassName =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <header className="page-content flex min-h-16 shrink-0 items-center gap-1 border-b border-hairline bg-surface">
      <button
        aria-label="이전 화면으로 돌아가기"
        className={`${iconButtonClassName} -ml-2`}
        onClick={onBack}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <AssistantAvatar />
        <div className="min-w-0">
          <h1 className="truncate type-title text-text-primary">{ASSISTANT_NAME}</h1>
          <p className="truncate type-caption text-text-tertiary">AI 책 추천</p>
        </div>
      </div>
      <button
        aria-label="대화 목록 열기"
        className={iconButtonClassName}
        onClick={onSessionListClick}
        type="button"
      >
        <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M5 7h14M5 12h14M5 17h9" />
        </svg>
      </button>
      <CartButton
        className={`${iconButtonClassName} -mr-2`}
        countEnabled
        onClick={onCartClick}
      />
    </header>
  );
}
