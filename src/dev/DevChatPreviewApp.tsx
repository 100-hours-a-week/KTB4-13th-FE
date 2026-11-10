import { useRef, useState } from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/app/layouts/AppLayout";
import { BottomNavigationLayout } from "@/app/layouts/BottomNavigationLayout";
import { chatPreviewReplies } from "@/dev/fixtures/chat";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/authContext";
import { ChatComposer } from "@/pages/recommendation-chat/components/ChatComposer";
import { ChatHeader } from "@/pages/recommendation-chat/components/ChatHeader";
import { ChatMessageList } from "@/pages/recommendation-chat/components/ChatMessageList";
import { splitFollowup } from "@/pages/recommendation-chat/lib/followupOptions";
import type {
  ChatPresentationMessage,
  ChatPresentationStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";

// Waits that roughly match production: the streamed draft first, then the final reply with cards.
const DRAFT_DELAY_MS = 900;
const FINAL_DELAY_MS = 1600;

const previewAuth: AuthContextValue = {
  accessToken: null,
  clearAccessToken: () => {},
  setAccessToken: () => {},
  status: "authenticated",
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

// Replays scripted replies through the production chat components; nothing is sent to a server.
function ChatPreview() {
  const [messages, setMessages] = useState<ChatPresentationMessage[]>([]);
  const [status, setStatus] = useState<ChatPresentationStatus>("idle");
  const nextIdRef = useRef(1);
  const nextReplyRef = useRef(0);

  const send = async (content: string) => {
    if (status === "sending") return;
    const reply = chatPreviewReplies[nextReplyRef.current % chatPreviewReplies.length];
    nextReplyRef.current += 1;
    const userId = `user-${nextIdRef.current++}`;
    const assistantId = `assistant-${nextIdRef.current++}`;
    setMessages((current) => [...current, { content, id: userId, role: "user" }]);
    setStatus("sending");

    await wait(DRAFT_DELAY_MS);
    setMessages((current) => [
      ...current,
      { content: reply.draft, id: assistantId, isLive: true, isPending: true, role: "assistant" },
    ]);

    await wait(FINAL_DELAY_MS);
    const followup = splitFollowup(reply.followup);
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
              content: reply.reply,
              followup: followup.text ?? undefined,
              id: assistantId,
              isLive: true,
              options: followup.options,
              recommendations: reply.cards,
              role: "assistant",
            }
          : message,
      ),
    );
    setStatus("idle");
  };

  return (
    <div className="relative flex h-full min-w-0 flex-col overflow-hidden bg-surface">
      <ChatHeader onBack={() => {}} onCartClick={() => {}} onSessionListClick={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto bg-background">
        <ChatMessageList
          isCheckoutLoading={false}
          messages={messages}
          onConfirmProposal={() => {}}
          onDeclineProposal={() => {}}
          onOpenCheckout={() => {}}
          onQuickMessage={(message) => { void send(message); }}
          onRetry={() => {}}
          onRetryProposal={() => {}}
          status={status}
        />
      </main>
      <ChatComposer onAttachClick={() => {}} onSend={(message) => { void send(message); }} status={status} />
    </div>
  );
}

export default function DevChatPreviewApp() {
  return (
    <AuthContext.Provider value={previewAuth}>
      <MemoryRouter initialEntries={["/recommendations/chat"]}>
        <AppLayout>
          {/* Same layout route as the real chat page, so the message list scrolls inside <main>. */}
          <Routes>
            <Route element={<BottomNavigationLayout />}>
              <Route element={<ChatPreview />} path="/recommendations/chat" />
              <Route element={<Navigate replace to="/recommendations/chat" />} path="*" />
            </Route>
          </Routes>
        </AppLayout>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
