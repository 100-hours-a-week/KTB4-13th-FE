import { useRef, useState } from "react";

import { sendRecommendationChat } from "@/features/recommendation/api/recommendationChatApi";
import type {
  RecommendationChatSpec,
  RecommendationChatTurn,
} from "@/features/recommendation/types/recommendationChat";
import type {
  ChatErrorReason,
  ChatPresentationMessage,
  ChatPresentationStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";

const MAX_RECENT_TURNS = 20;
const MAX_TURN_TEXT_LENGTH = 200;

// First-turn spec from the chat contract; later turns send back the spec the server returned.
const INITIAL_SPEC: RecommendationChatSpec = {
  anchor_book: null,
  exact: { author: null, publisher: null, title: null },
  exclude: [],
  filters: {},
  intent: "semantic",
  semantic: null,
};

export function useRecommendationChat() {
  const [messages, setMessages] = useState<ChatPresentationMessage[]>([]);
  const [status, setStatus] = useState<ChatPresentationStatus>("idle");
  const [errorReason, setErrorReason] = useState<ChatErrorReason | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const specRef = useRef<RecommendationChatSpec>(INITIAL_SPEC);
  const turnsRef = useRef<RecommendationChatTurn[]>([]);
  const shownBookIdsRef = useRef<number[]>([]);
  const isSendingRef = useRef(false);
  const nextMessageIdRef = useRef(1);

  const createMessageId = (role: "user" | "assistant") => {
    const id = `${role}-${nextMessageIdRef.current}`;
    nextMessageIdRef.current += 1;
    return id;
  };

  const requestReply = async (message: string) => {
    isSendingRef.current = true;
    setStatus("sending");
    setErrorReason(null);
    setFailedMessage(null);

    const result = await sendRecommendationChat({
      // TODO: Remove once the chat contract drops `consented`; V1 chat does not use it.
      consented: false,
      excludeBookIds: shownBookIdsRef.current,
      message,
      recentTurns: turnsRef.current.slice(-MAX_RECENT_TURNS),
      spec: specRef.current,
    });

    isSendingRef.current = false;

    if (!result.ok) {
      setErrorReason(result.reason);
      setFailedMessage(message);
      setStatus("error");
      return;
    }

    const { cards, followup, reply, spec } = result.data;
    const content = followup ? `${reply}\n\n${followup}` : reply;

    specRef.current = spec;
    turnsRef.current = [
      ...turnsRef.current,
      { role: "user" as const, text: message.slice(0, MAX_TURN_TEXT_LENGTH) },
      { role: "assistant" as const, text: content.slice(0, MAX_TURN_TEXT_LENGTH) },
    ].slice(-MAX_RECENT_TURNS);
    shownBookIdsRef.current = [
      ...new Set([...shownBookIdsRef.current, ...cards.map((card) => card.bookId)]),
    ];

    setMessages((current) => [
      ...current,
      {
        content,
        id: createMessageId("assistant"),
        recommendations: cards.map((card) => ({
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
      },
    ]);
    setStatus("idle");
  };

  const sendMessage = (content: string) => {
    const message = content.trim();

    if (!message || isSendingRef.current) {
      return;
    }

    setMessages((current) => [
      ...current,
      { content: message, id: createMessageId("user"), role: "user" },
    ]);
    void requestReply(message);
  };

  // Resends the failed message without adding a second user bubble.
  const retry = () => {
    if (failedMessage === null || isSendingRef.current) {
      return;
    }

    void requestReply(failedMessage);
  };

  return { errorReason, messages, retry, sendMessage, status };
}
