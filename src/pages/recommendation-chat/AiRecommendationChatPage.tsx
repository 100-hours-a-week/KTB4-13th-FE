import { useNavigate } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { Toast } from "@/common/components/Toast";
import { useTransientNotice } from "@/common/hooks/useTransientNotice";
import { ChatComposer } from "@/pages/recommendation-chat/components/ChatComposer";
import { ChatHeader } from "@/pages/recommendation-chat/components/ChatHeader";
import { ChatMessageList } from "@/pages/recommendation-chat/components/ChatMessageList";
import { useRecommendationChat } from "@/pages/recommendation-chat/hooks/useRecommendationChat";

const UNAVAILABLE_NOTICE = "아직 준비 중인 기능이에요";

export function AiRecommendationChatPage() {
  const navigate = useNavigate();
  const { notice, showNotice } = useTransientNotice();
  const { errorReason, messages, retry, sendMessage, status } =
    useRecommendationChat();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="relative flex h-dvh min-w-0 flex-col overflow-hidden bg-surface">
      <ChatHeader
        onBack={handleBack}
        onCartClick={() => navigate("/cart")}
      />

      <div className="page-content shrink-0 py-2">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border bg-muted px-3 type-caption text-text-secondary disabled:cursor-not-allowed disabled:opacity-70"
          disabled
          type="button"
        >
          <span aria-hidden="true">≡</span>
          대화 목록
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessageList
          errorReason={errorReason}
          messages={messages}
          onRetry={retry}
          status={status}
        />
      </main>

      {notice ? (
        <div className="page-content pointer-events-none absolute inset-x-0 bottom-36 z-10">
          <Toast>{notice}</Toast>
        </div>
      ) : null}

      <ChatComposer
        onAttachClick={() =>
          showNotice("이미지 첨부 기능을 준비하고 있어요")
        }
        onSend={sendMessage}
        status={status}
      />
      <BottomNavigation
        onUnavailableTabClick={() => showNotice(UNAVAILABLE_NOTICE)}
      />
    </div>
  );
}
