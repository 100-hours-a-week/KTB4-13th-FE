import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { ChatComposer } from "@/pages/recommendation-chat/components/ChatComposer";
import { ChatHeader } from "@/pages/recommendation-chat/components/ChatHeader";
import { ChatMessageList } from "@/pages/recommendation-chat/components/ChatMessageList";
import { ChatSessionList } from "@/pages/recommendation-chat/components/ChatSessionList";
import { useRecommendationChat } from "@/pages/recommendation-chat/hooks/useRecommendationChat";

export function AiRecommendationChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const parsedSessionId = Number(new URLSearchParams(location.search).get("sessionId"));
  const initialSessionId = Number.isSafeInteger(parsedSessionId) && parsedSessionId > 0 ? parsedSessionId : null;
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  const [attachmentNotice, setAttachmentNotice] = useState(false);
  const chat = useRecommendationChat(initialSessionId, (sessionId) => {
    navigate(sessionId ? `/recommendations/chat?sessionId=${sessionId}` : "/recommendations/chat", { replace: true });
  });

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
          onClick={() => setIsSessionListOpen(true)}
          type="button"
        >
          <span aria-hidden="true">≡</span>
          대화 목록
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {chat.isHistoryLoading ? (
          <p
            aria-busy="true"
            className="page-content py-5 type-body-small text-text-tertiary"
            role="status"
          >
            대화를 불러오는 중이에요
          </p>
        ) : chat.historyError ? (
          <div className="page-content py-5">
            <Toast
              action={<RetryButton onClick={chat.retryHistory} />}
              variant="error"
            >
              대화를 불러오지 못했어요
            </Toast>
          </div>
        ) : (
          <ChatMessageList
            messages={chat.messages}
            onConfirmProposal={chat.confirmProposal}
            onDeclineProposal={chat.declineProposal}
            onQuickMessage={chat.sendMessage}
            onRetry={chat.retry}
            onRetryProposal={chat.retryProposal}
            status={chat.status}
          />
        )}
      </main>

      {attachmentNotice ? (
        <div className="page-content shrink-0 pb-2">
          <Toast>사진으로 책 찾기는 아직 지원하지 않아요. 제목이나 작가를 입력해 주세요.</Toast>
        </div>
      ) : null}
      <ChatComposer
        onAttachClick={() => setAttachmentNotice(true)}
        onSend={chat.sendMessage}
        status={chat.status}
      />
      <BottomNavigation />
      <ChatSessionList activeSessionId={chat.sessionId} hasError={chat.sessionsError} isOpen={isSessionListOpen} onClose={() => setIsSessionListOpen(false)} onNewSession={chat.startNewSession} onRetry={() => { void chat.loadSessions(); }} onSelect={chat.selectSession} sessions={chat.sessions} />
    </div>
  );
}
