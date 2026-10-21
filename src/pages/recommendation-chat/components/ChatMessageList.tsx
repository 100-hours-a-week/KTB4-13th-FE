import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { ProductAvailabilityBadge } from "@/common/components/ProductAvailabilityBadge";
import { LoginRequiredDialog } from "@/features/auth/components/LoginRequiredDialog";
import { useAuth } from "@/features/auth/context/useAuth";
import { addCartItem, fetchCart } from "@/features/cart/api/cartApi";
import { notifyCartChanged } from "@/features/cart/lib/cartEvents";
import type {
  CartProposalItemViewModel,
  ChatErrorReason,
  ChatPresentationMessage,
  ChatPresentationStatus,
  ProposalExecutionStatus,
  RecommendationCardViewModel,
} from "@/pages/recommendation-chat/types/chatPresentation";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const MAX_RECOMMENDATIONS = 3;
const MAX_CART_ITEMS = 30;

const ERROR_MESSAGES: Record<ChatErrorReason, string> = {
  busy: "요청이 많아요. 잠시 후 다시 보내 주세요",
  error: "메시지를 보내지 못했어요",
  "invalid-request": "메시지를 처리하지 못했어요. 내용을 바꿔 다시 보내 주세요",
  timeout: "답변이 늦어지고 있어요. 다시 보내 주세요",
};

const EXECUTION_MESSAGES: Record<Exclude<ProposalExecutionStatus, "pending">, string> = {
  declined: "제안을 거절했어요. 장바구니는 그대로예요.",
  error: "아직 반영되지 않았어요. 다시 시도해도 중복으로 담기지 않아요.",
  executed: "장바구니에 반영했어요.",
  executing: "장바구니에 반영하는 중이에요.",
  expired: "제안 시간이 지났어요. 채팅으로 다시 요청해 주세요.",
  invalidated: "장바구니 상태가 바뀌어 이 제안은 적용할 수 없어요.",
  "proposal-error": "제안 정보를 확인하지 못했어요.",
  rejected: "요청을 처리할 수 없어요.",
};

function executionMessageClassName(status: ProposalExecutionStatus) {
  if (status === "executed") return "text-success";
  if (status === "declined" || status === "executing") {
    return "text-text-tertiary";
  }
  return "text-error";
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
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
  // recommendationCardId lets the detail page load the long AI reason (FE #116).
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
      className={`flex h-full flex-col rounded-control border p-1.5 transition-colors ${
        isSelected ? "border-accent bg-accent-soft" : "border-transparent"
      }`}
    >
      <div className="relative">
        {detailPath ? (
          <Link
            aria-label={`${recommendation.title} 상세 보기`}
            className="block rounded-cover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            to={detailPath}
          >
            {cover}
          </Link>
        ) : (
          <div className="opacity-60">{cover}</div>
        )}
        <button
          aria-label={hasProduct ? `${recommendation.title} 선택` : `${recommendation.title}은 구매할 수 없어요`}
          aria-pressed={hasProduct ? isSelected : undefined}
          className="group absolute -right-1.5 -top-1.5 flex size-11 items-start justify-end p-2 focus-visible:outline-none disabled:cursor-not-allowed"
          disabled={!hasProduct || isSending}
          onClick={onToggle}
          type="button"
        >
          <span
            className={`flex size-6 items-center justify-center rounded-full border-2 shadow-sm transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary ${
              isSelected
                ? "border-accent bg-accent text-white"
                : hasProduct
                  ? "border-white bg-black/25 text-transparent"
                  : "border-border bg-muted text-transparent"
            }`}
          >
            <CheckIcon />
          </span>
        </button>
      </div>
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
      {recommendation.productId === null ? (
        <div className="mt-1">
          <ProductAvailabilityBadge />
        </div>
      ) : null}
      <p className="mt-1.5 line-clamp-2 type-caption text-text-secondary">
        <span className="font-semibold tabular-nums text-accent">매칭 {recommendation.matchScore}%</span>
        {recommendation.reasonShort ? ` · ${recommendation.reasonShort}` : null}
      </p>
    </article>
  );
}

function RecommendationCardList({
  isSending,
  recommendations,
}: {
  isSending: boolean;
  recommendations: RecommendationCardViewModel[];
}) {
  const location = useLocation();
  const { status: authStatus } = useAuth();
  const visibleRecommendations = recommendations.slice(0, MAX_RECOMMENDATIONS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoginRequired, setIsLoginRequired] = useState(false);
  const isAddingRef = useRef(false);
  const selectedRecommendations = visibleRecommendations.filter(
    (recommendation) => selectedIds.has(recommendation.id),
  );

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

  const handleAddToCart = async () => {
    if (selectedRecommendations.length === 0 || isSending || isAddingRef.current) {
      return;
    }
    if (authStatus !== "authenticated") {
      setIsLoginRequired(true);
      return;
    }

    isAddingRef.current = true;
    setIsAdding(true);
    setResults({});
    try {
      const cart = await fetchCart();
      if (!cart.ok) {
        if (cart.reason === "unauthorized") {
          setIsLoginRequired(true);
        } else {
          setResults(Object.fromEntries(selectedRecommendations.map((book) => [
            book.id,
            "장바구니를 확인하지 못했어요. 다시 시도해 주세요",
          ])));
        }
        return;
      }

      const cartProductIds = new Set(cart.data.items.map((item) => item.productId));
      const nextResults: Record<string, string> = {};
      let hasAdded = false;
      for (const book of selectedRecommendations) {
        if (book.productId === null) continue;
        if (cartProductIds.has(book.productId)) {
          nextResults[book.id] = "이미 담긴 책이에요";
        } else if (cartProductIds.size >= MAX_CART_ITEMS) {
          nextResults[book.id] = "장바구니는 최대 30종까지 담을 수 있어요";
        } else {
          const result = await addCartItem(book.productId, 1);
          if (result.ok) {
            cartProductIds.add(book.productId);
            nextResults[book.id] = "장바구니에 담았어요";
            hasAdded = true;
          } else if (result.reason === "stock") {
            nextResults[book.id] = "재고가 부족해 담지 못했어요";
          } else if (result.reason === "unauthorized") {
            nextResults[book.id] = "로그인이 필요해요";
            setIsLoginRequired(true);
            break;
          } else {
            nextResults[book.id] = "담지 못했어요. 다시 시도해 주세요";
          }
        }
      }
      setResults(nextResults);
      if (hasAdded) notifyCartChanged({ animate: true });
    } finally {
      isAddingRef.current = false;
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-3">
      <div
        aria-label="AI 추천 도서 목록"
        className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        role="region"
        tabIndex={0}
      >
        <ul className="flex items-stretch gap-2">
          {visibleRecommendations.map((recommendation) => (
            <li className="w-36 shrink-0 sm:w-40" key={recommendation.id}>
              <RecommendationCard
                isSending={isSending || isAdding}
                isSelected={selectedIds.has(recommendation.id)}
                onToggle={() => handleToggle(recommendation.id)}
                recommendation={recommendation}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex min-h-11 max-w-md items-center justify-between gap-3">
        <p className="min-w-0 type-caption text-text-secondary" role="status">
          {selectedRecommendations.length > 0 ? (
            <strong className="font-semibold text-text-primary">{selectedRecommendations.length}권 선택</strong>
          ) : "표지의 체크를 눌러 담을 책을 고르세요"}
        </p>
        {selectedRecommendations.length > 0 ? (
          <button
            className="min-h-10 shrink-0 rounded-control bg-primary px-3.5 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-text-tertiary"
            disabled={isSending || isAdding}
            onClick={() => { void handleAddToCart(); }}
            type="button"
          >
            {isAdding ? "담는 중" : "담기"}
          </button>
        ) : null}
      </div>
      {Object.keys(results).length > 0 ? (
        <ul aria-label="장바구니 담기 결과" className="mt-2 space-y-1" role="status">
          {visibleRecommendations.filter((book) => results[book.id]).map((book) => (
            <li className="type-caption text-text-secondary" key={book.id}>
              <span className="font-semibold text-text-primary">{book.title}</span>: {results[book.id]}
            </li>
          ))}
        </ul>
      ) : null}
      <LoginRequiredDialog
        description="로그인하면 보고 있던 책에서 계속할 수 있어요."
        isOpen={isLoginRequired}
        onClose={() => setIsLoginRequired(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="장바구니를 이용하려면 로그인이 필요해요"
      />
    </div>
  );
}

function proposalChangeLabel(item: CartProposalItemViewModel) {
  if (item.operation === "remove") {
    return `${item.expectedQuantity}권 빼기`;
  }
  if (item.expectedQuantity === 0) {
    return `${item.quantity ?? 0}권 담기`;
  }
  return `수량 ${item.expectedQuantity}권 → ${item.quantity ?? 0}권`;
}

interface CartProposalPanelProps {
  confirmLabel: string | null;
  message: Extract<ChatPresentationMessage, { role: "assistant" }>;
  onConfirm: (() => void) | null;
  onDecline: (() => void) | null;
  onQuickMessage: (message: string) => void;
  onRetryProposal: (() => void) | null;
}

// Groups the server-issued proposal, its approve/decline actions and the execution feedback in one block.
function CartProposalPanel({
  confirmLabel,
  message,
  onConfirm,
  onDecline,
  onQuickMessage,
  onRetryProposal,
}: CartProposalPanelProps) {
  const { executionStatus, proposal } = message;
  const isPending = executionStatus === "pending";
  const isExecuting = executionStatus === "executing";

  return (
    <section
      aria-label="장바구니 변경 제안"
      className="mt-3 max-w-md overflow-hidden rounded-panel border border-border bg-surface"
    >
      {proposal ? (
        <>
          <h3 className="border-b border-hairline px-4 py-2.5 type-caption font-semibold text-text-secondary">
            장바구니 변경 제안
          </h3>
          <ul className="divide-y divide-hairline px-4">
            {proposal.items.map((item) => (
              <li className="flex min-w-0 items-center justify-between gap-3 py-2.5" key={item.productId}>
                <div className="min-w-0">
                  <Link
                    className="line-clamp-1 rounded-sm type-body-small font-semibold text-text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    to={`/products/${item.productId}`}
                  >
                    {item.itemName ?? `상품 #${item.productId}`}
                  </Link>
                  <p className="type-caption text-text-tertiary">
                    {proposalChangeLabel(item)}
                  </p>
                </div>
                {item.expectedUnitPrice !== null ? (
                  <p className="shrink-0 type-body-small font-semibold tabular-nums text-text-primary">
                    {priceFormatter.format(item.expectedUnitPrice)}원
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className={`px-4 py-3 ${proposal ? "border-t border-hairline bg-muted/60" : ""}`}>
        {executionStatus && !isPending ? (
          <p
            aria-live="polite"
            className={`flex items-center gap-2 type-caption ${executionMessageClassName(executionStatus)}`}
            role="status"
          >
            {isExecuting ? (
              <span aria-hidden="true" className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {EXECUTION_MESSAGES[executionStatus]}
          </p>
        ) : null}
        {isPending && onConfirm && onDecline ? (
          <div className="flex gap-2">
            <button
              className="min-h-11 rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onDecline}
              type="button"
            >
              거절
            </button>
            <button
              className="min-h-11 flex-1 rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        ) : null}
        {executionStatus === "error" && onConfirm ? (
          <button
            className="mt-2 min-h-11 w-full rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onConfirm}
            type="button"
          >
            다시 시도
          </button>
        ) : null}
        {executionStatus === "proposal-error" && onRetryProposal ? (
          <button
            className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onRetryProposal}
            type="button"
          >
            제안 다시 확인하기
          </button>
        ) : null}
        {executionStatus === "executed" ? (
          <div className="mt-2 flex gap-2">
            <Link
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control bg-primary px-4 type-body-small font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              to="/cart"
            >
              장바구니 확인
            </Link>
            <button
              className="min-h-11 rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => onQuickMessage("내 취향에 맞는 책을 더 추천해줘")}
              type="button"
            >
              더 추천받기
            </button>
          </div>
        ) : null}
      </div>
    </section>
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
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[78%] whitespace-pre-wrap break-words rounded-control bg-primary px-3.5 py-2.5 type-body-small text-white">
          {message.content}
        </p>
      </div>
    );
  }

  // Approve/decline only render for a proposalId the server actually returned.
  const proposalButton = message.agentButtons?.find(
    (button) => button.action === "confirm_selection" && button.proposalId !== null,
  );
  const proposalId = proposalButton?.proposalId ?? null;
  const navigateButtons = (message.agentButtons ?? []).flatMap((button) => {
    if (button.action !== "navigate") return [];
    const target = button.target === "CART-001" ? "/cart" : button.target === "ORDER-LIST-001" ? "/my/orders" : null;
    if (!target || (target === "/cart" && message.executionStatus === "executed")) return [];
    return [{ label: button.label, target }];
  });
  const hasProposalPanel = proposalId !== null || message.proposal !== undefined || (message.executionStatus !== undefined && message.executionStatus !== "pending");

  return (
    <div className="min-w-0">
      <p className="whitespace-pre-wrap break-words type-body leading-relaxed text-text-primary">
        {message.content}
      </p>
      {message.recommendations?.length ? (
        <>
          <RecommendationCardList
            isSending={status === "sending"}
            recommendations={message.recommendations}
          />
          <button
            className="min-h-11 rounded-control px-2 -ml-2 type-body-small font-semibold text-text-secondary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:text-text-disabled"
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
      {hasProposalPanel ? (
        <CartProposalPanel
          confirmLabel={proposalButton?.label ?? null}
          message={message}
          onConfirm={proposalId !== null ? () => onConfirmProposal(message.id, proposalId) : null}
          onDecline={proposalId !== null ? () => onDeclineProposal(message.id, proposalId) : null}
          onQuickMessage={onQuickMessage}
          onRetryProposal={proposalId !== null ? () => onRetryProposal(message.id, proposalId) : null}
        />
      ) : null}
      {navigateButtons.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {navigateButtons.map((button) => (
            <Link
              className="inline-flex min-h-11 items-center rounded-control border border-border px-4 type-body-small font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              key={`${button.target}-${button.label}`}
              to={button.target}
            >
              {button.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const STARTER_QUESTIONS = [
  "살인 사건을 수사하는 추리소설을 추천해줘",
  "인간관계를 다룬 책을 추천해줘",
  "개발 공부를 하고싶어",
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
