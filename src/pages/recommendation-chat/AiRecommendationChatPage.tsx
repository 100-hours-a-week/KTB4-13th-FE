import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { CHAT_ASK_PARAM, readChatAsk } from "@/features/recommendation/lib/chatEntry";
import { ChatComposer } from "@/pages/recommendation-chat/components/ChatComposer";
import { ChatHeader } from "@/pages/recommendation-chat/components/ChatHeader";
import { ChatMessageList } from "@/pages/recommendation-chat/components/ChatMessageList";
import { ChatSessionList } from "@/pages/recommendation-chat/components/ChatSessionList";
import { useRecommendationChat } from "@/pages/recommendation-chat/hooks/useRecommendationChat";
import { loadAgentCheckout } from "@/pages/recommendation-chat/lib/agentCheckout";
import type { ChatCheckout } from "@/pages/recommendation-chat/types/chatPresentation";

export function AiRecommendationChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const parsedSessionId = Number(new URLSearchParams(location.search).get("sessionId"));
  const initialSessionId = Number.isSafeInteger(parsedSessionId) && parsedSessionId > 0 ? parsedSessionId : null;
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  const sessionListTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "error">("idle");
  const checkoutRequestRef = useRef<AbortController | null | undefined>(undefined);

  useEffect(() => {
    checkoutRequestRef.current = null;
    return () => {
      checkoutRequestRef.current?.abort();
      checkoutRequestRef.current = undefined;
    };
  }, []);

  const handleOpenCheckout = async (checkout: ChatCheckout) => {
    if (checkoutRequestRef.current !== null) return;
    const controller = new AbortController();
    checkoutRequestRef.current = controller;
    setCheckoutStatus("loading");
    const result = await loadAgentCheckout(checkout, controller.signal);
    if (controller.signal.aborted) return;

    checkoutRequestRef.current = null;
    if (result.kind === "ready") {
      setCheckoutStatus("idle");
      navigate("/order", { state: result.state });
    } else if (result.kind === "empty") {
      setCheckoutStatus("idle");
      navigate("/cart");
    } else {
      setCheckoutStatus("error");
    }
  };

  const resetCheckout = () => {
    checkoutRequestRef.current?.abort();
    checkoutRequestRef.current = null;
    setCheckoutStatus("idle");
  };

  const chat = useRecommendationChat(
    initialSessionId,
    (sessionId) => {
      if (checkoutRequestRef.current === undefined) return;
      resetCheckout();
      navigate(sessionId ? `/recommendations/chat?sessionId=${sessionId}` : "/recommendations/chat", { replace: true });
    },
    handleOpenCheckout,
  );

  const handleSend = (message: string) => {
    resetCheckout();
    chat.sendMessage(message);
  };

  const askedMessage = initialSessionId === null ? readChatAsk(location.search) : null;
  const sentAskKeyRef = useRef<string | null>(null);
  const sendEntryQuestion = useEffectEvent((question: string) => {
    const params = new URLSearchParams(location.search);
    params.delete(CHAT_ASK_PARAM);
    navigate({ pathname: location.pathname, search: params.toString(), hash: location.hash }, { replace: true });
    handleSend(question);
  });

  useEffect(() => {
    if (!askedMessage || chat.isHistoryLoading || sentAskKeyRef.current === location.key) return;
    // Replacing the URL prevents reload/back from sending again. The key also covers effect replay.
    sentAskKeyRef.current = location.key;
    sendEntryQuestion(askedMessage);
  }, [askedMessage, chat.isHistoryLoading, location.key]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="relative flex h-full min-w-0 flex-col overflow-hidden bg-surface">
      <ChatHeader
        onBack={handleBack}
        onCartClick={() => navigate("/cart")}
        onSessionListClick={(event) => {
          sessionListTriggerRef.current = event.currentTarget;
          setIsSessionListOpen(true);
        }}
      />

      <main className="min-h-0 flex-1 overflow-y-auto bg-background">
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
            isCheckoutLoading={checkoutStatus === "loading"}
            messages={chat.messages}
            onConfirmProposal={chat.confirmProposal}
            onDeclineProposal={chat.declineProposal}
            onOpenCheckout={handleOpenCheckout}
            onQuickMessage={handleSend}
            onRetry={(messageId) => {
              resetCheckout();
              chat.retry(messageId);
            }}
            onRetryProposal={chat.retryProposal}
            status={chat.status}
          />
        )}
      </main>

      {checkoutStatus !== "idle" ? (
        <div className="page-content shrink-0 bg-background pb-2">
          {checkoutStatus === "loading" ? (
            <p className="type-body-small text-text-secondary" role="status">
              주문할 책을 확인하고 있어요
            </p>
          ) : (
            <Toast variant="error">주문 정보를 불러오지 못했어요. 주문 화면 버튼을 다시 눌러 주세요.</Toast>
          )}
        </div>
      ) : null}
      <ChatComposer onSend={handleSend} status={chat.status} />
      <ChatSessionList activeSessionId={chat.sessionId} hasError={chat.sessionsError} isOpen={isSessionListOpen} onClose={() => setIsSessionListOpen(false)} onNewSession={chat.startNewSession} onRetry={() => { void chat.loadSessions(); }} onSelect={chat.selectSession} returnFocusRef={sessionListTriggerRef} sessions={chat.sessions} />
    </div>
  );
}
