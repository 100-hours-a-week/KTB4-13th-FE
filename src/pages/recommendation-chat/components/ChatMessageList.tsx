import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
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
    <article className="flex h-full flex-col">
      <BookCover
        alt={`${recommendation.title} 표지`}
        fallbackTitle={recommendation.title}
        radius="cover"
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
        <p className="mt-1 type-body-small font-semibold tabular-nums text-text-primary">
          {priceFormatter.format(recommendation.price)}원
        </p>
      ) : null}
      <p className="mt-2 type-caption font-medium tabular-nums text-accent">
        매칭 {recommendation.matchScore}%
      </p>
      {recommendation.reasonShort ? (
        <p className="mt-1.5 line-clamp-2 border-l border-border-strong pl-2 type-caption leading-relaxed text-text-secondary">
          {recommendation.reasonShort}
        </p>
      ) : null}
      {recommendation.productId === null ? (
        <div className="mt-1.5">
          <ProductAvailabilityBadge />
        </div>
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
      className="block h-full rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={`/products/${recommendation.productId}?recommendationCardId=${recommendation.id}`}
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
      <ul className="flex items-stretch gap-4">
        {visibleRecommendations.map((recommendation) => (
          <li
            className="w-[calc(42%-22px)] shrink-0 min-[360px]:w-[42%]"
            key={recommendation.id}
          >
            <RecommendationCard recommendation={recommendation} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatPresentationMessage;
  onConfirmProposal: (messageId: string, proposalId: number) => void;
  onDeclineProposal: (messageId: string) => void;
}

function ChatBubble({ message, onConfirmProposal, onDeclineProposal }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[78%]" : "w-full min-w-0"}>
        <p
          className={`whitespace-pre-wrap break-words ${
            isUser
              ? "rounded-control bg-primary px-3.5 py-2.5 type-body-small text-white"
              : "type-body leading-relaxed text-text-primary"
          }`}
        >
          {message.content}
        </p>
        {message.role === "assistant" && message.recommendations?.length ? (
          <RecommendationCardList recommendations={message.recommendations} />
        ) : null}
        {message.role === "assistant" && message.agentButtons?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.agentButtons.map((button) => {
              if (button.action === "navigate") {
                const target = button.target === "CART-001" ? "/cart" : button.target === "ORDER-LIST-001" ? "/my/orders" : null;
                return target ? <Link className="inline-flex min-h-11 items-center rounded-control border border-border px-4 type-body-small font-semibold text-text-primary" key={`${button.action}-${button.label}`} to={target}>{button.label}</Link> : null;
              }
              if (button.action === "confirm_selection" && button.proposalId !== null) {
                const disabled = message.executionStatus !== "pending";
                return <span className="contents" key={`${button.action}-${button.proposalId}`}><button className="min-h-11 rounded-control bg-primary px-4 type-body-small font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={() => onConfirmProposal(message.id, button.proposalId!)} type="button">{message.executionStatus === "pending" ? button.label : message.executionStatus === "executing" ? "반영 중" : "처리 완료"}</button><button className="min-h-11 rounded-control border border-border px-4 type-body-small font-semibold disabled:opacity-50" disabled={disabled} onClick={() => onDeclineProposal(message.id)} type="button">괜찮아요</button></span>;
              }
              return null;
            })}
          </div>
        ) : null}
        {message.role === "assistant" && message.executionStatus && message.executionStatus !== "pending" ? <p className={`mt-3 type-caption ${message.executionStatus === "executed" ? "text-success" : message.executionStatus === "declined" || message.executionStatus === "executing" ? "text-text-tertiary" : "text-error"}`} role="status">{message.executionStatus === "executed" ? "장바구니에 반영했어요" : message.executionStatus === "executing" ? "장바구니에 반영하고 있어요" : message.executionStatus === "declined" ? "제안을 적용하지 않았어요" : message.executionStatus === "rejected" ? "제안을 실행할 수 없어요" : "장바구니에 반영하지 못했어요"}</p> : null}
      </div>
    </div>
  );
}

interface ChatMessageListProps {
  messages: ChatPresentationMessage[];
  onConfirmProposal: (messageId: string, proposalId: number) => void;
  onDeclineProposal: (messageId: string) => void;
  onRetry: (messageId: string) => void;
  status: ChatPresentationStatus;
}

export function ChatMessageList({
  messages,
  onConfirmProposal,
  onDeclineProposal,
  onRetry,
  status,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, status]);

  return (
    <div className="page-content py-5">
      <ol aria-live="polite" className="flex flex-col gap-6">
        {messages.map((message) => (
          <li key={message.id}>
            <ChatBubble message={message} onConfirmProposal={onConfirmProposal} onDeclineProposal={onDeclineProposal} />
            {message.role === "user" && message.errorReason ? (
              <div
                className="mt-4 flex flex-wrap items-center gap-x-3"
                role="alert"
              >
                <p className="type-body-small text-error">
                  {ERROR_MESSAGES[message.errorReason]}
                </p>
                <button
                  className="min-h-11 rounded-control px-2 type-body-small font-semibold text-text-primary underline underline-offset-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
                  disabled={status === "sending"}
                  onClick={() => onRetry(message.id)}
                  type="button"
                >
                  다시 보내기
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      {status === "sending" ? (
        <p
          aria-live="polite"
          className="mt-6 w-fit type-body-small text-text-tertiary"
          role="status"
        >
          추천을 준비하고 있어요
        </p>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
