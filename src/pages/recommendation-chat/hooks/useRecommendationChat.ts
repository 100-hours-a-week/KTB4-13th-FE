import { useCallback, useEffect, useRef, useState } from "react";

import { notifyCartChanged } from "@/features/cart/lib/cartEvents";
import {
  confirmCartProposal,
  createChatSession,
  fetchChatHistory,
  fetchChatSessions,
  fetchCartProposalStatus,
  sendSessionMessage,
} from "@/features/recommendation/api/recommendationSessionApi";
import type {
  ChatHistoryMessage,
  ChatSessionSummary,
  SessionChatReply,
} from "@/features/recommendation/types/recommendationChat";
import type {
  ChatPresentationMessage,
  ChatPresentationStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";

function replyContent(reply: SessionChatReply) {
  return reply.followup ? `${reply.reply}\n\n${reply.followup}` : reply.reply;
}

function toAssistantMessage(
  id: string,
  reply: SessionChatReply,
): ChatPresentationMessage {
  const executionStatus = reply.execution?.status;
  return {
    agentButtons: reply.buttons,
    content: replyContent(reply),
    executionStatus:
      executionStatus === "rejected"
        ? "rejected"
        : executionStatus === "executed" || executionStatus === "applied"
          ? "executed"
          : reply.buttons.some((button) => button.action === "confirm_selection")
            ? "pending"
            : undefined,
    id,
    recommendations: reply.cards.map((card) => ({
      author: card.author,
      coverImageUrl: card.coverImageUrl,
      id: String(card.recommendationCardId),
      matchScore: card.matchScore,
      price: card.price,
      productId: card.productId,
      reasonShort: card.reasonShort,
      title: card.title,
    })),
    role: "assistant",
  };
}

function toHistoryMessages(
  history: ChatHistoryMessage[],
): ChatPresentationMessage[] {
  return history.map((message) => {
    if (message.role === "user") {
      return {
        content: message.text,
        id: `history-${message.id}`,
        role: "user" as const,
      };
    }
    return message.response
      ? toAssistantMessage(`history-${message.id}`, message.response)
      : {
          content: message.text,
          id: `history-${message.id}`,
          role: "assistant" as const,
        };
  });
}

async function restoreProposalStatuses(
  messages: ChatPresentationMessage[],
  signal: AbortSignal,
) {
  return Promise.all(messages.map(async (message) => {
    if (message.role !== "assistant" || message.executionStatus !== "pending") return message;
    const proposalId = message.agentButtons?.find((button) => button.action === "confirm_selection")?.proposalId;
    if (proposalId === null || proposalId === undefined) return message;
    const proposalStatus = await fetchCartProposalStatus(proposalId, signal);
    return {
      ...message,
      executionStatus: proposalStatus === "unavailable" ? "rejected" as const : proposalStatus,
    };
  }));
}

export function useRecommendationChat(
  initialSessionId: number | null,
  onSessionChange: (sessionId: number | null) => void,
) {
  const [messages, setMessages] = useState<ChatPresentationMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(initialSessionId);
  const [isHistoryLoading, setIsHistoryLoading] = useState(
    initialSessionId !== null,
  );
  const [historyError, setHistoryError] = useState(false);
  const [historyRequestKey, setHistoryRequestKey] = useState(0);
  const [sessionsError, setSessionsError] = useState(false);
  const [status, setStatus] = useState<ChatPresentationStatus>("idle");
  const shownBookIdsRef = useRef<number[]>([]);
  const isSendingRef = useRef(false);
  const nextMessageIdRef = useRef(1);
  const skipHistorySessionIdRef = useRef<number | null>(null);

  const createMessageId = (role: "user" | "assistant") =>
    `${role}-${nextMessageIdRef.current++}`;

  const loadSessions = useCallback(async (signal?: AbortSignal) => {
    const result = await fetchChatSessions(signal);
    if (signal?.aborted) return;
    if (result.ok) {
      setSessions(result.data);
      setSessionsError(false);
    } else {
      setSessionsError(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchChatSessions(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setSessions(result.data);
        setSessionsError(false);
      } else {
        setSessionsError(true);
      }
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (sessionId === null) return undefined;
    if (skipHistorySessionIdRef.current === sessionId) {
      skipHistorySessionIdRef.current = null;
      return undefined;
    }
    const controller = new AbortController();
    void fetchChatHistory(sessionId, controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setHistoryError(false);
        const restoredMessages = await restoreProposalStatuses(
          toHistoryMessages(result.data),
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setMessages(restoredMessages);
        shownBookIdsRef.current = result.data.flatMap(
          (message) =>
            message.response?.cards.map((card) => card.bookId) ?? [],
        );
      } else {
        setMessages([]);
        setHistoryError(true);
      }
      setIsHistoryLoading(false);
    });
    return () => controller.abort();
  }, [historyRequestKey, sessionId]);

  const selectSession = (nextSessionId: number) => {
    if (isSendingRef.current || nextSessionId === sessionId) return;
    setIsHistoryLoading(true);
    setHistoryError(false);
    setStatus("idle");
    setSessionId(nextSessionId);
    onSessionChange(nextSessionId);
  };

  const startNewSession = () => {
    if (isSendingRef.current) return;
    setSessionId(null);
    setMessages([]);
    setStatus("idle");
    setIsHistoryLoading(false);
    setHistoryError(false);
    shownBookIdsRef.current = [];
    onSessionChange(null);
  };

  const requestReply = async (message: string, messageId: string) => {
    isSendingRef.current = true;
    setStatus("sending");
    setMessages((current) =>
      current.map((item) =>
        item.role === "user" && item.id === messageId
          ? { content: item.content, id: item.id, role: "user" }
          : item,
      ),
    );

    let activeSessionId = sessionId;
    if (activeSessionId === null) {
      const created = await createChatSession();
      if (!created.ok) {
        isSendingRef.current = false;
        setMessages((current) =>
          current.map((item) =>
            item.role === "user" && item.id === messageId
              ? { ...item, errorReason: created.reason }
              : item,
          ),
        );
        setStatus("error");
        return;
      }
      activeSessionId = created.data;
      skipHistorySessionIdRef.current = activeSessionId;
      setSessionId(activeSessionId);
      onSessionChange(activeSessionId);
      void loadSessions();
    }

    const result = await sendSessionMessage(
      activeSessionId,
      message,
      shownBookIdsRef.current,
    );
    isSendingRef.current = false;
    if (!result.ok) {
      setMessages((current) =>
        current.map((item) =>
          item.role === "user" && item.id === messageId
            ? { ...item, errorReason: result.reason }
            : item,
        ),
      );
      setStatus("error");
      return;
    }

    shownBookIdsRef.current = [
      ...new Set([
        ...shownBookIdsRef.current,
        ...result.data.cards.map((card) => card.bookId),
      ]),
    ];
    if (result.data.execution?.status === "applied") {
      notifyCartChanged({ animate: true });
    }
    setMessages((current) => [
      ...current,
      toAssistantMessage(createMessageId("assistant"), result.data),
    ]);
    setStatus("idle");
    void loadSessions();
  };

  const sendMessage = (content: string) => {
    const message = content.trim();
    if (!message || isSendingRef.current) return;
    const messageId = createMessageId("user");
    setMessages((current) => [
      ...current,
      { content: message, id: messageId, role: "user" },
    ]);
    void requestReply(message, messageId);
  };

  const retry = (messageId: string) => {
    if (isSendingRef.current) return;
    const failedMessage = messages.find(
      (message) =>
        message.role === "user" &&
        message.id === messageId &&
        message.errorReason !== undefined,
    );
    if (failedMessage) void requestReply(failedMessage.content, failedMessage.id);
  };

  const confirmProposal = async (messageId: string, proposalId: number) => {
    setMessages((current) =>
      current.map((message) =>
        message.role === "assistant" && message.id === messageId
          ? { ...message, executionStatus: "executing" }
          : message,
      ),
    );
    const result = await confirmCartProposal(proposalId);
    setMessages((current) =>
      current.map((message) =>
        message.role === "assistant" && message.id === messageId
          ? {
              ...message,
              executionStatus: result.ok ? "executed" : "error",
            }
          : message,
      ),
    );
    if (result.ok) notifyCartChanged({ animate: true });
  };

  const declineProposal = (messageId: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.role === "assistant" && message.id === messageId
          ? { ...message, executionStatus: "declined" }
          : message,
      ),
    );
  };

  return {
    confirmProposal,
    declineProposal,
    historyError,
    isHistoryLoading,
    loadSessions,
    messages,
    retry,
    retryHistory: () => {
      if (sessionId === null) return;
      setHistoryError(false);
      setIsHistoryLoading(true);
      setHistoryRequestKey((value) => value + 1);
    },
    selectSession,
    sendMessage,
    sessionId,
    sessions,
    sessionsError,
    startNewSession,
    status,
  };
}
