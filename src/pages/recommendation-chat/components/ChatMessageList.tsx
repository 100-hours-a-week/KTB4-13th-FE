import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import type {
  ChatErrorReason,
  ChatPresentationMessage,
  ChatPresentationStatus,
  RecommendationCardViewModel,
} from "@/pages/recommendation-chat/types/chatPresentation";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const MAX_RECOMMENDATIONS = 3;

const ERROR_MESSAGES: Record<ChatErrorReason, string> = {
  busy: "요청이 많아요. 잠시 후 다시 보내 주세요",
  error: "메시지를 보내지 못했어요",
  "invalid-request": "메시지를 처리하지 못했어요. 내용을 바꿔 다시 보내 주세요",
  timeout: "답변이 늦어지고 있어요. 다시 보내 주세요",
};

function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationCardViewModel;
}) {
  const card = (
    <article className="flex h-full flex-col rounded-panel border border-border bg-surface p-2.5">
      <BookCover
        alt={`${recommendation.title} 표지`}
        thumbnailUrl={recommendation.coverImageUrl}
      />
      <h3 className="mt-2 line-clamp-2 type-body-small font-semibold text-text-primary">
        {recommendation.title}
      </h3>
      {recommendation.author ? (
        <p className="mt-0.5 truncate type-caption text-text-tertiary">
          {recommendation.author}
        </p>
      ) : null}
      {recommendation.price !== null ? (
        <p className="mt-1 type-body-small font-bold text-text-primary">
          {priceFormatter.format(recommendation.price)}원
        </p>
      ) : null}
      <p className="mt-2 type-caption font-semibold text-accent">
        매칭 {recommendation.matchScore}%
      </p>
      {recommendation.reasonShort ? (
        <p className="mt-1 line-clamp-2 type-caption text-text-secondary">
          {recommendation.reasonShort}
        </p>
      ) : null}
    </article>
  );

  // Only cards backed by an active product can open product detail; bookId is not a productId.
  if (recommendation.productId === null) {
    return card;
  }

  return (
    <Link
      aria-label={`${recommendation.title} 상세 보기`}
      className="block h-full rounded-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={`/products/${recommendation.productId}`}
    >
      {card}
    </Link>
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
  errorReason: ChatErrorReason | null;
  messages: ChatPresentationMessage[];
  onRetry: () => void;
  status: ChatPresentationStatus;
}

export function ChatMessageList({
  errorReason,
  messages,
  onRetry,
  status,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, status]);

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
        <div className="mt-4 flex flex-wrap items-center gap-x-3" role="alert">
          <p className="type-body-small text-error">
            {ERROR_MESSAGES[errorReason ?? "error"]}
          </p>
          <button
            className="min-h-11 rounded-control px-2 type-body-small font-semibold text-text-primary underline underline-offset-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onRetry}
            type="button"
          >
            다시 보내기
          </button>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
