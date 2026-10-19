import { useNavigate } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { ChatComposer } from "@/pages/recommendation-chat/components/ChatComposer";
import { ChatHeader } from "@/pages/recommendation-chat/components/ChatHeader";
import { ChatMessageList } from "@/pages/recommendation-chat/components/ChatMessageList";
import { useRecommendationChat } from "@/pages/recommendation-chat/hooks/useRecommendationChat";

export function AiRecommendationChatPage() {
  const navigate = useNavigate();
  const { messages, retry, sendMessage, status } = useRecommendationChat();

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
          className="-ml-2 inline-flex min-h-10 items-center gap-2 rounded-control px-2 type-caption text-text-tertiary disabled:cursor-not-allowed"
          disabled
          type="button"
        >
          <span aria-hidden="true">≡</span>
          대화 목록
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessageList
          messages={messages}
          onRetry={retry}
          status={status}
        />
      </main>

      <ChatComposer
        onAttachClick={() => navigate("/recommendations/scan")}
        onSend={sendMessage}
        status={status}
      />
      <BottomNavigation />
    </div>
  );
}
