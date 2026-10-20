import { useCallback, useEffect, useRef, useState } from "react";

import { notifyCartChanged } from "@/features/cart/lib/cartEvents";
import {
  confirmCartProposal,
  createChatSession,
  fetchChatHistory,
  fetchChatSessions,
  fetchCartProposal,
  sendSessionMessage,
} from "@/features/recommendation/api/recommendationSessionApi";
import { fetchProductDetail } from "@/features/product/api/productDetailApi";
import type {
  AgentCartProposal,
  ChatHistoryMessage,
  ChatSessionSummary,
  SessionChatReply,
} from "@/features/recommendation/types/recommendationChat";
import type {
  ChatPresentationMessage,
  ChatPresentationStatus,
  CartProposalViewModel,
  ProposalExecutionStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/pages/recommendation-chat/lib/chatMessage";

const DECLINED_PROPOSALS_STORAGE_KEY = "bookjeok-chat-declined-proposals";

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

function proposalIdOf(message: ChatPresentationMessage) {
  if (message.role !== "assistant") return null;
  return message.agentButtons?.find(
    (button) => button.action === "confirm_selection",
  )?.proposalId ?? message.proposal?.proposalId ?? null;
}

function readDeclinedProposalIds() {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(DECLINED_PROPOSALS_STORAGE_KEY) ?? "[]",
    );
    return new Set(
      Array.isArray(value)
        ? value.filter(
            (item): item is number => Number.isSafeInteger(item) && item > 0,
          )
        : [],
    );
  } catch {
    return new Set<number>();
  }
}

function storeDeclinedProposal(proposalId: number) {
  const proposalIds = [...readDeclinedProposalIds(), proposalId].slice(-100);
  try {
    window.localStorage.setItem(
      DECLINED_PROPOSALS_STORAGE_KEY,
      JSON.stringify([...new Set(proposalIds)]),
    );
  } catch {
    // The current screen still keeps the declined state when storage is unavailable.
  }
}

function executionStatusForProposal(
  proposal: AgentCartProposal,
  isDeclined: boolean,
): ProposalExecutionStatus {
  if (proposal.status === "executed") return "executed";
  if (proposal.status === "expired") return "expired";
  if (proposal.status === "invalidated") return "invalidated";
  return isDeclined ? "declined" : "pending";
}

async function toProposalViewModel(
  proposal: AgentCartProposal,
  signal?: AbortSignal,
): Promise<CartProposalViewModel> {
  const products = await Promise.all(
    proposal.items.map((item) => fetchProductDetail(item.productId, signal)),
  );

  return {
    ...proposal,
    items: proposal.items.map((item, index) => {
      const product = products[index];
      return {
        ...item,
        itemName: product.ok ? product.data.itemName : null,
      };
    }),
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
  signal?: AbortSignal,
) {
  return Promise.all(messages.map(async (message) => {
    if (message.role !== "assistant") return message;
    const proposalId = proposalIdOf(message);
    if (proposalId === null || proposalId === undefined) return message;
    const result = await fetchCartProposal(proposalId, signal);
    if (!result.ok) {
      return { ...message, executionStatus: "proposal-error" as const };
    }
    const proposal = await toProposalViewModel(result.data, signal);
    return {
      ...message,
      executionStatus: executionStatusForProposal(
        result.data,
        readDeclinedProposalIds().has(proposalId),
      ),
      proposal,
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
  const executingProposalIdsRef = useRef(new Set<number>());
  const proposalIdempotencyKeysRef = useRef(new Map<number, string>());
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
    if (
      isSendingRef.current ||
      executingProposalIdsRef.current.size > 0 ||
      nextSessionId === sessionId
    ) return;
    setIsHistoryLoading(true);
    setHistoryError(false);
    setStatus("idle");
    setSessionId(nextSessionId);
    onSessionChange(nextSessionId);
  };

  const startNewSession = () => {
    if (isSendingRef.current || executingProposalIdsRef.current.size > 0) return;
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
    const assistantMessage = toAssistantMessage(
      createMessageId("assistant"),
      result.data,
    );
    const [restoredAssistantMessage] = await restoreProposalStatuses([
      assistantMessage,
    ]);
    setMessages((current) => [...current, restoredAssistantMessage]);
    setStatus("idle");
    void loadSessions();
  };

  const sendMessage = (content: string) => {
    const message = content.trim();
    if (
      !message ||
      message.length > MAX_CHAT_MESSAGE_LENGTH ||
      isSendingRef.current
    ) return;
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

  const updateProposalMessage = (
    messageId: string,
    executionStatus: ProposalExecutionStatus,
    proposal?: CartProposalViewModel,
  ) => {
    setMessages((current) =>
      current.map((message) =>
        message.role === "assistant" && message.id === messageId
          ? { ...message, executionStatus, proposal: proposal ?? message.proposal }
          : message,
      ),
    );
  };

  const readProposal = async (proposalId: number) => {
    const result = await fetchCartProposal(proposalId);
    if (!result.ok) return result;
    return {
      data: {
        proposal: result.data,
        viewModel: await toProposalViewModel(result.data),
      },
      ok: true as const,
    };
  };

  const confirmProposal = async (messageId: string, proposalId: number) => {
    if (executingProposalIdsRef.current.has(proposalId)) return;
    executingProposalIdsRef.current.add(proposalId);
    updateProposalMessage(messageId, "executing");

    try {
      const currentProposal = await readProposal(proposalId);
      if (!currentProposal.ok) {
        updateProposalMessage(messageId, "proposal-error");
        return;
      }

      if (currentProposal.data.proposal.status !== "pending") {
        const nextStatus = executionStatusForProposal(
          currentProposal.data.proposal,
          false,
        );
        updateProposalMessage(
          messageId,
          nextStatus,
          currentProposal.data.viewModel,
        );
        if (nextStatus === "executed") notifyCartChanged({ animate: true });
        return;
      }

      updateProposalMessage(
        messageId,
        "executing",
        currentProposal.data.viewModel,
      );
      let idempotencyKey = proposalIdempotencyKeysRef.current.get(proposalId);
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        proposalIdempotencyKeysRef.current.set(proposalId, idempotencyKey);
      }
      const result = await confirmCartProposal(proposalId, idempotencyKey);
      if (result.ok) {
        updateProposalMessage(messageId, "executed", {
          ...currentProposal.data.viewModel,
          executionId: result.data.executionId,
          status: "executed",
        });
        notifyCartChanged({ animate: true });
        return;
      }

      const refreshedProposal = await readProposal(proposalId);
      if (!refreshedProposal.ok) {
        updateProposalMessage(messageId, "error");
        return;
      }
      const nextStatus = executionStatusForProposal(
        refreshedProposal.data.proposal,
        false,
      );
      updateProposalMessage(
        messageId,
        nextStatus === "pending" ? "error" : nextStatus,
        refreshedProposal.data.viewModel,
      );
      if (nextStatus === "executed") notifyCartChanged({ animate: true });
    } finally {
      executingProposalIdsRef.current.delete(proposalId);
    }
  };

  const declineProposal = (messageId: string, proposalId: number) => {
    storeDeclinedProposal(proposalId);
    updateProposalMessage(messageId, "declined");
  };

  const retryProposal = async (messageId: string, proposalId: number) => {
    if (executingProposalIdsRef.current.has(proposalId)) return;
    executingProposalIdsRef.current.add(proposalId);
    updateProposalMessage(messageId, "executing");
    try {
      const result = await readProposal(proposalId);
      if (!result.ok) {
        updateProposalMessage(messageId, "proposal-error");
        return;
      }
      updateProposalMessage(
        messageId,
        executionStatusForProposal(
          result.data.proposal,
          readDeclinedProposalIds().has(proposalId),
        ),
        result.data.viewModel,
      );
    } finally {
      executingProposalIdsRef.current.delete(proposalId);
    }
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
    retryProposal,
    selectSession,
    sendMessage,
    sessionId,
    sessions,
    sessionsError,
    startNewSession,
    status,
  };
}
