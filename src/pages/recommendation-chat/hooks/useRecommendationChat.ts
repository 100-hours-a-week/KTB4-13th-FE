import { useCallback, useEffect, useRef, useState } from "react";

import { notifyCartChanged } from "@/features/cart/lib/cartEvents";
import {
  confirmCartProposal,
  createChatSession,
  fetchChatHistory,
  fetchChatSessions,
  fetchCartProposal,
  sendSessionMessage,
  type SendSessionMessageInput,
} from "@/features/recommendation/api/recommendationSessionApi";
import { fetchProductDetail } from "@/features/product/api/productDetailApi";
import type {
  AgentCartProposal,
  ChatHistoryMessage,
  ChatSessionSummary,
  SessionChatReply,
} from "@/features/recommendation/types/recommendationChat";
import type {
  ChatCheckout,
  ChatPresentationMessage,
  ChatPresentationStatus,
  CartProposalViewModel,
  ProposalExecutionStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/pages/recommendation-chat/lib/chatMessage";
import { splitFollowup } from "@/pages/recommendation-chat/lib/followupOptions";

const DECLINED_PROPOSALS_STORAGE_KEY = "bookjeok-chat-declined-proposals";
// Waits before re-asking with the same key while the server may still be answering (about 26 seconds in total).
const RECOVERY_DELAYS_MS = [1000, 2000, 3000, 4000, 4000, 4000, 4000, 4000];

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function isRecoverable(reason: string) {
  return reason === "in-progress" || reason === "interrupted";
}

function toAssistantMessage(
  id: string,
  reply: SessionChatReply,
): Extract<ChatPresentationMessage, { role: "assistant" }> {
  const executionStatus = reply.execution?.status;
  const executionId = reply.execution?.executionId;
  const checkoutButton = reply.buttons.find(
    (button) => button.action === "navigate" && button.target === "ORDER-001",
  );
  const hasCheckout =
    reply.route === "shop" &&
    executionStatus === "applied" &&
    typeof executionId === "number" &&
    Number.isSafeInteger(executionId) &&
    executionId > 0 &&
    checkoutButton !== undefined;

  const followup = splitFollowup(reply.followup);

  return {
    agentButtons: reply.buttons,
    checkout: hasCheckout
      ? { benefits: reply.checkout, executionId, label: checkoutButton.label }
      : undefined,
    content: reply.reply,
    executionStatus:
      executionStatus === "rejected"
        ? "rejected"
        : executionStatus === "executed" || executionStatus === "applied"
          ? "executed"
          : reply.buttons.some((button) => button.action === "confirm_selection")
            ? "pending"
            : undefined,
    followup: followup.text ?? undefined,
    id,
    options: followup.options,
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
    if (message.response) {
      return toAssistantMessage(`history-${message.id}`, message.response);
    }
    // The stored line is reply + followup; option lines become options instead of plain text.
    const stored = splitFollowup(message.text);
    return {
      content: stored.text ?? "",
      id: `history-${message.id}`,
      options: stored.options,
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
  onCheckout: (checkout: ChatCheckout) => void,
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
  // Kept per user message while its outcome is unknown, so a retry cannot apply a cart change twice.
  const unresolvedSendsRef = useRef(new Map<string, SendSessionMessageInput>());
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

    const targetSessionId = activeSessionId;
    const input = unresolvedSendsRef.current.get(messageId) ?? {
      excludeBookIds: [...shownBookIdsRef.current],
      idempotencyKey: crypto.randomUUID(),
      message,
    };
    unresolvedSendsRef.current.set(messageId, input);
    const assistantMessageId = createMessageId("assistant");
    const showDraft = (content: string) => {
      setMessages((current) =>
        current.some((item) => item.id === assistantMessageId)
          ? current.map((item) =>
              item.role === "assistant" && item.id === assistantMessageId
                ? { ...item, content }
                : item,
            )
          : [
              ...current,
              { content, id: assistantMessageId, isLive: true, isPending: true, role: "assistant" },
            ],
      );
    };
    const sendAttempt = () => {
      // A resumed attempt streams the reply again from the start.
      let draft = "";
      return sendSessionMessage(targetSessionId, input, (text) => {
        draft += text;
        showDraft(draft);
      });
    };

    let result = await sendAttempt();
    for (const delay of RECOVERY_DELAYS_MS) {
      if (result.ok || !isRecoverable(result.reason)) break;
      await wait(delay);
      result = await sendAttempt();
    }
    isSendingRef.current = false;
    if (!result.ok) {
      const { reason } = result;
      // A definite failure is replayed for the same key, so the next retry starts a new request.
      if (!isRecoverable(reason)) unresolvedSendsRef.current.delete(messageId);
      setMessages((current) =>
        current.flatMap((item) => {
          if (item.id === assistantMessageId) return [];
          return item.role === "user" && item.id === messageId
            ? [{ ...item, errorReason: reason }]
            : [item];
        }),
      );
      setStatus("error");
      return;
    }
    unresolvedSendsRef.current.delete(messageId);

    shownBookIdsRef.current = [
      ...new Set([
        ...shownBookIdsRef.current,
        ...result.data.cards.map((card) => card.bookId),
      ]),
    ];
    if (result.data.execution?.status === "applied") {
      notifyCartChanged({ animate: true });
    }
    const assistantMessage = {
      ...toAssistantMessage(assistantMessageId, result.data),
      isLive: true,
    };
    const [restoredAssistantMessage] = await restoreProposalStatuses([
      assistantMessage,
    ]);
    // The final reply replaces the streamed draft, which may differ from it.
    setMessages((current) =>
      current.some((item) => item.id === assistantMessageId)
        ? current.map((item) =>
            item.id === assistantMessageId ? restoredAssistantMessage : item,
          )
        : [...current, restoredAssistantMessage],
    );
    setStatus("idle");
    void loadSessions();
    if (assistantMessage.checkout) onCheckout(assistantMessage.checkout);
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
