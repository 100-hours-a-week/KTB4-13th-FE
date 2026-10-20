import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
import { MAX_CHAT_MESSAGE_LENGTH } from "@/pages/recommendation-chat/lib/chatMessage";
import type {
  CartProposalItemViewModel,
  CartProposalViewModel,
  ChatErrorReason,
  ChatPresentationMessage,
  ChatPresentationStatus,
  ProposalExecutionStatus,
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

const EXECUTION_MESSAGES: Record<Exclude<ProposalExecutionStatus, "pending">, string> = {
  declined: "이 제안은 적용하지 않았어요.",
  error: "반영 여부를 확인했지만 아직 적용되지 않았어요. 같은 요청으로 안전하게 다시 시도할 수 있어요.",
  executed: "실제 장바구니에 반영했어요.",
  executing: "제안과 장바구니 상태를 확인하고 있어요.",
  expired: "제안 시간이 만료됐어요. 채팅으로 다시 요청해 주세요.",
  invalidated: "장바구니 상태가 달라져 이 제안은 실행할 수 없어요.",
  "proposal-error": "제안 정보를 확인하지 못했어요.",
  rejected: "요청을 실행할 수 없어요.",
};

function executionMessageClassName(status: ProposalExecutionStatus) {
  if (status === "executed") return "text-success";
  if (status === "declined" || status === "executing") {
    return "text-text-tertiary";
  }
  return "text-error";
}

function RecommendationCard({
  isSending,
  isSelected,
  onToggle,
  recommendation,
}: {
  isSending: boolean;
  isSelected: boolean;
  onToggle: () => void;
  recommendation: RecommendationCardViewModel;
}) {
  const hasProduct = recommendation.productId !== null;
  const detailPath = hasProduct
    ? `/products/${recommendation.productId}?recommendationCardId=${recommendation.id}`
    : null;
  const cover = (
    <BookCover
      alt={`${recommendation.title} 표지`}
      fallbackTitle={recommendation.title}
      radius="cover"
      thumbnailUrl={recommendation.coverImageUrl}
    />
  );

  return (
    <article
      className={`flex h-full flex-col rounded-control border p-2 transition-colors ${
        isSelected
          ? "border-accent bg-accent-soft"
          : "border-transparent bg-surface"
      }`}
    >
      {detailPath ? (
        <Link
          aria-label={`${recommendation.title} 상세 보기`}
          className="rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to={detailPath}
        >
          {cover}
        </Link>
      ) : cover}
      <h3 className="mt-2 line-clamp-2 type-body-small font-semibold text-text-primary">
        {detailPath ? (
          <Link
            className="rounded-sm underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            to={detailPath}
          >
            {recommendation.title}
          </Link>
        ) : recommendation.title}
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
      <button
        aria-pressed={hasProduct ? isSelected : undefined}
        className={`mt-3 min-h-11 w-full rounded-control border px-2 type-caption font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-border disabled:text-text-disabled ${
          isSelected
            ? "border-accent bg-accent text-white"
            : "border-border bg-surface text-text-primary hover:bg-muted"
        }`}
        disabled={!hasProduct || isSending}
        onClick={onToggle}
        type="button"
      >
        {hasProduct ? (isSelected ? "선택됨" : "선택") : "구매할 수 없어요"}
      </button>
    </article>
  );
}

function RecommendationCardList({
  isSending,
  onRequestCart,
  recommendations,
}: {
  isSending: boolean;
  onRequestCart: (title: string) => void;
  recommendations: RecommendationCardViewModel[];
}) {
  const visibleRecommendations = recommendations.slice(0, MAX_RECOMMENDATIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedRecommendations = visibleRecommendations.filter(
    (recommendation) => selectedIds.has(recommendation.id),
  );
  const cartRequest = `이 책들을 각 1권씩 장바구니에 담는 제안을 보여줘: ${selectedRecommendations
    .map((recommendation) => `『${recommendation.title}』`)
    .join(", ")}`;
  const isRequestTooLong = cartRequest.length > MAX_CHAT_MESSAGE_LENGTH;

  const handleToggle = (recommendationId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recommendationId)) {
        next.delete(recommendationId);
      } else {
        next.add(recommendationId);
      }
      return next;
    });
  };

  const handleRequestCart = () => {
    if (
      selectedRecommendations.length === 0 ||
      isSending ||
      isRequestTooLong
    ) return;
    onRequestCart(cartRequest);
    setSelectedIds(new Set());
  };

  return (
    <div className="mt-3">
      <div
        aria-label="AI 추천 도서 목록"
        className="-mx-5 overflow-x-auto px-5 pb-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        role="region"
        tabIndex={0}
      >
        <ul className="flex items-stretch gap-4">
          {visibleRecommendations.map((recommendation) => (
            <li
              className="w-[calc(42%-22px)] shrink-0 min-[360px]:w-[42%]"
              key={recommendation.id}
            >
              <RecommendationCard
                isSending={isSending}
                isSelected={selectedIds.has(recommendation.id)}
                onToggle={() => handleToggle(recommendation.id)}
                recommendation={recommendation}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex min-h-11 items-center justify-between gap-3 border-t border-hairline pt-3">
        <p className="type-caption text-text-secondary" role="status">
          {selectedRecommendations.length > 0
            ? isRequestTooLong
              ? "제목이 길어 선택을 줄여 주세요"
              : `${selectedRecommendations.length}권 선택 · 각 1권`
            : "담을 책을 선택해 주세요"}
        </p>
        <button
          className="min-h-11 shrink-0 rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-tertiary"
          disabled={
            selectedRecommendations.length === 0 ||
            isSending ||
            isRequestTooLong
          }
          onClick={handleRequestCart}
          type="button"
        >
          선택한 책 담기 요청
        </button>
      </div>
    </div>
  );
}

function proposalChangeLabel(item: CartProposalItemViewModel) {
  if (item.operation === "remove") {
    return `장바구니에서 ${item.expectedQuantity}권 빼기`;
  }
  if (item.expectedQuantity === 0) {
    return `장바구니에 ${item.quantity ?? 0}권 담기`;
  }
  return `수량 ${item.expectedQuantity}권 → ${item.quantity ?? 0}권`;
}

function CartProposalSummary({ proposal }: { proposal: CartProposalViewModel }) {
  return (
    <section
      aria-label="장바구니 변경 제안"
      className="mt-4 rounded-panel border border-border bg-muted p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="type-title">장바구니 변경 내용</h3>
        <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 type-caption text-text-secondary">
          {proposal.items.length}개 상품
        </span>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {proposal.items.map((item) => (
          <li className="py-3 first:pt-0 last:pb-0" key={item.productId}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="line-clamp-2 rounded-sm type-body-small font-semibold text-text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  to={`/products/${item.productId}`}
                >
                  {item.itemName ?? `상품 #${item.productId}`}
                </Link>
                <p className="mt-1 type-caption text-text-secondary">
                  {proposalChangeLabel(item)}
                </p>
              </div>
              {item.expectedUnitPrice !== null ? (
                <p className="shrink-0 type-body-small font-semibold tabular-nums text-text-primary">
                  {priceFormatter.format(item.expectedUnitPrice)}원
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {proposal.status === "pending" ? (
        <p className="mt-3 type-caption text-text-tertiary">
          승인하면 표시된 수량으로 장바구니가 변경돼요.
        </p>
      ) : null}
    </section>
  );
}

function CompletionActions({
  onQuickMessage,
}: {
  onQuickMessage: (message: string) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to="/cart"
      >
        장바구니 확인하기
      </Link>
      <Link
        className="inline-flex min-h-11 items-center rounded-control border border-border px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to="/"
      >
        쇼핑 계속하기
      </Link>
      <button
        className="min-h-11 rounded-control border border-border px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => onQuickMessage("내 취향에 맞는 책을 더 추천해줘")}
        type="button"
      >
        추가 추천받기
      </button>
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatPresentationMessage;
  onConfirmProposal: (messageId: string, proposalId: number) => void;
  onDeclineProposal: (messageId: string, proposalId: number) => void;
  onQuickMessage: (message: string) => void;
  onRetryProposal: (messageId: string, proposalId: number) => void;
  status: ChatPresentationStatus;
}

function ChatBubble({
  message,
  onConfirmProposal,
  onDeclineProposal,
  onQuickMessage,
  onRetryProposal,
  status,
}: ChatBubbleProps) {
  const isUser = message.role === "user";
  const proposalButton = message.role === "assistant"
    ? message.agentButtons?.find(
        (button) => button.action === "confirm_selection",
      )
    : undefined;
  const retryProposalId = proposalButton?.proposalId ?? null;

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
          <>
            <RecommendationCardList
              isSending={status === "sending"}
              onRequestCart={onQuickMessage}
              recommendations={message.recommendations}
            />
            <button
              className="mt-3 min-h-11 rounded-control px-2 type-body-small font-semibold text-text-secondary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-disabled"
              disabled={status === "sending"}
              onClick={() =>
                onQuickMessage("방금 추천과 겹치지 않는 다른 책을 추천해줘")
              }
              type="button"
            >
              다른 책 추천받기
            </button>
          </>
        ) : null}
        {message.role === "assistant" && message.proposal ? (
          <CartProposalSummary proposal={message.proposal} />
        ) : null}
        {message.role === "assistant" && message.agentButtons?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.agentButtons.map((button) => {
              if (button.action === "navigate") {
                const target = button.target === "CART-001" ? "/cart" : button.target === "ORDER-LIST-001" ? "/my/orders" : null;
                if (target === "/cart" && message.executionStatus === "executed") {
                  return null;
                }
                return target ? (
                  <Link
                    className="inline-flex min-h-11 items-center rounded-control border border-border px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    key={`${button.action}-${button.label}`}
                    to={target}
                  >
                    {button.label}
                  </Link>
                ) : null;
              }
              if (button.action === "confirm_selection" && button.proposalId !== null) {
                const proposalId = button.proposalId;
                const canConfirm = message.executionStatus === "pending" || message.executionStatus === "error";
                const confirmLabel = message.executionStatus === "pending"
                  ? button.label
                  : message.executionStatus === "error"
                    ? "안전하게 다시 시도"
                    : message.executionStatus === "executing"
                      ? "확인 중"
                      : "처리 완료";
                return (
                  <span className="contents" key={`${button.action}-${proposalId}`}>
                    <button
                      className="min-h-11 rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canConfirm}
                      onClick={() => onConfirmProposal(message.id, proposalId)}
                      type="button"
                    >
                      {confirmLabel}
                    </button>
                    <button
                      className="min-h-11 rounded-control border border-border px-4 type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={message.executionStatus !== "pending"}
                      onClick={() => onDeclineProposal(message.id, proposalId)}
                      type="button"
                    >
                      제안 거절
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        ) : null}
        {message.role === "assistant" && message.executionStatus && message.executionStatus !== "pending" ? (
          <p
            aria-live="polite"
            className={`mt-3 type-caption ${executionMessageClassName(message.executionStatus)}`}
            role="status"
          >
            {EXECUTION_MESSAGES[message.executionStatus]}
          </p>
        ) : null}
        {message.role === "assistant" && message.executionStatus === "proposal-error" && retryProposalId !== null ? (
          <button
            className="mt-2 min-h-11 rounded-control px-2 type-body-small font-semibold text-text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => onRetryProposal(message.id, retryProposalId)}
            type="button"
          >
            제안 다시 확인하기
          </button>
        ) : null}
        {message.role === "assistant" && message.executionStatus === "executed" ? (
          <CompletionActions onQuickMessage={onQuickMessage} />
        ) : null}
      </div>
    </div>
  );
}

const STARTER_QUESTIONS = [
  "내 독서 취향에 맞는 책을 추천해줘",
  "기분 전환이 필요할 때 읽을 책 있을까?",
  "출퇴근길에 가볍게 읽을 책을 찾아줘",
];

// FE-only greeting shown before the first message; it is never sent to or stored by the server.
function WelcomeMessage({
  onQuickMessage,
}: {
  onQuickMessage: (message: string) => void;
}) {
  return (
    <section aria-label="AI 첫 인사" className="mb-6">
      <p className="w-fit max-w-[85%] whitespace-pre-line rounded-control bg-muted px-3.5 py-2.5 type-body-small text-text-primary">
        {"안녕하세요, 북적북적 AI예요.\n요즘 취향이나 기분, 책을 읽을 상황을 알려주시면 어울리는 책을 골라드릴게요."}
      </p>
      <ul aria-label="추천 질문" className="mt-3 flex flex-wrap gap-2">
        {STARTER_QUESTIONS.map((question) => (
          <li key={question}>
            <button
              className="min-h-10 rounded-full border border-border bg-surface px-3.5 type-body-small text-text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => onQuickMessage(question)}
              type="button"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ChatMessageListProps {
  messages: ChatPresentationMessage[];
  onConfirmProposal: (messageId: string, proposalId: number) => void;
  onDeclineProposal: (messageId: string, proposalId: number) => void;
  onQuickMessage: (message: string) => void;
  onRetry: (messageId: string) => void;
  onRetryProposal: (messageId: string, proposalId: number) => void;
  status: ChatPresentationStatus;
}

export function ChatMessageList({
  messages,
  onConfirmProposal,
  onDeclineProposal,
  onQuickMessage,
  onRetry,
  onRetryProposal,
  status,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, status]);

  return (
    <div className="page-content py-5">
      {messages.length === 0 && status !== "sending" ? (
        <WelcomeMessage onQuickMessage={onQuickMessage} />
      ) : null}
      <ol aria-live="polite" className="flex flex-col gap-6">
        {messages.map((message) => (
          <li key={message.id}>
            <ChatBubble
              message={message}
              onConfirmProposal={onConfirmProposal}
              onDeclineProposal={onDeclineProposal}
              onQuickMessage={onQuickMessage}
              onRetryProposal={onRetryProposal}
              status={status}
            />
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
