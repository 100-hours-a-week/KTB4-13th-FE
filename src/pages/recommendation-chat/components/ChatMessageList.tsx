import { useEffect, useRef } from "react";

import { BookCover } from "@/common/components/BookCover";
import type {
  ChatPresentationMessage,
  ChatPresentationStatus,
  RecommendationCardViewModel,
} from "@/pages/recommendation-chat/types/chatPresentation";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const MAX_RECOMMENDATIONS = 3;

function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationCardViewModel;
}) {
  return (
    <article className="flex h-full flex-col rounded-panel border border-border bg-surface p-2.5">
      <BookCover
        alt={`${recommendation.title} 표지`}
        thumbnailUrl={recommendation.coverImageUrl}
      />
      <h3 className="mt-2 line-clamp-2 type-body-small font-semibold text-text-primary">
        {recommendation.title}
      </h3>
      <p className="mt-0.5 truncate type-caption text-text-tertiary">
        {recommendation.author}
      </p>
      <p className="mt-1 type-body-small font-bold text-text-primary">
        {priceFormatter.format(recommendation.price)}원
      </p>
      <p className="mt-2 type-caption font-semibold text-accent">
        매칭 {recommendation.matchScore}%
      </p>
      <p className="mt-1 line-clamp-2 type-caption text-text-secondary">
        {recommendation.reasonShort}
      </p>
    </article>
  );
}

function RecommendationCardList({
  recommendations,
}: {
  recommendations: RecommendationCardViewModel[];
}) {
  const visibleRecommendations = recommendations.slice(0, MAX_RECOMMENDATIONS);

  return (
    <div
      aria-label="AI 추천 도서 목록"
      className="-mx-5 mt-3 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      role="region"
      tabIndex={0}
    >
      <ul className="flex items-stretch gap-3">
        {visibleRecommendations.map((recommendation) => (
          <li className="w-[42%] shrink-0" key={recommendation.id}>
            <RecommendationCard recommendation={recommendation} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatPresentationMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[78%]" : "min-w-0 max-w-[86%]"}>
        <p
          className={`whitespace-pre-wrap break-words rounded-panel px-4 py-3 type-body-small ${
            isUser
              ? "bg-primary text-white"
              : "bg-muted text-text-primary"
          }`}
        >
          {message.content}
        </p>
        {message.role === "assistant" && message.recommendations?.length ? (
          <RecommendationCardList recommendations={message.recommendations} />
        ) : null}
      </div>
    </div>
  );
}

interface ChatMessageListProps {
  messages: ChatPresentationMessage[];
  status: ChatPresentationStatus;
}

export function ChatMessageList({ messages, status }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="page-content py-5">
      <ol aria-live="polite" className="flex flex-col gap-4">
        {messages.map((message) => (
          <li key={message.id}>
            <ChatBubble message={message} />
          </li>
        ))}
      </ol>

      {status === "sending" ? (
        <p
          aria-live="polite"
          className="mt-4 w-fit rounded-panel bg-muted px-4 py-3 type-body-small text-text-secondary"
          role="status"
        >
          추천을 준비하고 있어요
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 type-body-small text-error" role="alert">
          메시지를 보내지 못했어요
        </p>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
