import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import type {
  OrderHistoryEntry,
  OrderStatus,
} from "@/features/order/types/order";

const priceFormatter = new Intl.NumberFormat("ko-KR");
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const STATUS_LABELS: Record<OrderStatus, string> = {
  CANCELED: "주문 취소",
  CREATED: "주문 접수",
  PAID: "결제 완료",
  PARTIAL_CANCELED: "부분 취소",
};

interface OrderHistoryListProps {
  hasLoadMoreError: boolean;
  nextCursor: string | null;
  onLoadMore: () => void;
  onRetry: () => void;
  orders: OrderHistoryEntry[];
  status: "loading" | "ready" | "error" | "loadingMore";
}

function formatOrderDate(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : `${dateFormatter.format(date)} 주문`;
}

function OrderCard({ order }: { order: OrderHistoryEntry }) {
  return (
    <article className="rounded-panel border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-primary px-2 py-1 type-caption font-semibold text-white">
          {STATUS_LABELS[order.status]}
        </span>
        <time
          className="type-caption tabular-nums text-text-tertiary"
          dateTime={order.createdAt}
        >
          {formatOrderDate(order.createdAt)}
        </time>
      </div>

      <ul className="mt-3 divide-y divide-hairline">
        {order.items.map((item) => (
          <li className="py-3 first:pt-0 last:pb-0" key={item.orderItemId}>
            <div className="flex gap-3">
              <div className="w-14 shrink-0">
                <BookCover
                  alt=""
                  fallbackTitle={item.itemName}
                  radius="cover"
                  thumbnailUrl={item.thumbnailUrl}
                />
              </div>
              <div className="min-w-0 flex-1 self-center">
                <h2 className="line-clamp-2 type-title text-text-primary">
                  {item.itemName}
                </h2>
                <p className="mt-1 truncate type-caption text-text-secondary">
                  {item.author}
                </p>
                <p className="mt-1 type-body-small font-semibold tabular-nums text-text-primary">
                  {priceFormatter.format(item.totalPrice)}원
                  <span className="ml-1 font-normal text-text-tertiary">
                    · {item.quantity}권
                  </span>
                </p>
              </div>
            </div>
            <div className={`mt-3 grid gap-2 ${order.status === "PAID" ? "grid-cols-2" : "grid-cols-1"}`}>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-control border border-border type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" to={`/products/${item.productId}`}>도서 상세</Link>
              {order.status === "PAID" ? <Link className="inline-flex min-h-11 items-center justify-center rounded-control border border-accent type-body-small font-semibold text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" to={`/products/${item.productId}/reviews/new`}>리뷰 쓰기</Link> : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
        <span className="type-body-small text-text-secondary">총 결제금액</span>
        <strong className="type-title tabular-nums text-text-primary">
          {priceFormatter.format(order.totalPrice)}원
        </strong>
      </div>
    </article>
  );
}

export function OrderHistoryList({
  hasLoadMoreError,
  nextCursor,
  onLoadMore,
  onRetry,
  orders,
  status,
}: OrderHistoryListProps) {
  if (status === "loading") {
    return (
      <div aria-busy="true" className="page-content space-y-3 py-5">
        <p className="sr-only" role="status">주문내역을 불러오는 중이에요</p>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            aria-hidden="true"
            className="h-52 animate-pulse rounded-panel border border-border bg-muted"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-content py-6">
        <Toast action={<RetryButton onClick={onRetry} />} variant="error">
          주문내역을 불러오지 못했어요
        </Toast>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="page-content flex min-h-80 flex-col items-center justify-center text-center">
        <h2 className="type-title text-text-primary">아직 주문 내역이 없어요</h2>
        <p className="mt-2 type-body-small text-text-secondary">
          마음에 드는 책을 둘러보세요
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-5 type-body-small font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/"
        >
          책 구경하기
        </Link>
      </section>
    );
  }

  return (
    <div className="page-content space-y-3 py-5">
      {orders.map((order) => <OrderCard key={order.key} order={order} />)}
      {nextCursor !== null ? (
        <div aria-live="polite" className="flex flex-col items-center gap-2 pt-2">
          {hasLoadMoreError ? (
            <p className="type-body-small text-error">목록을 더 불러오지 못했어요</p>
          ) : null}
          <button
            className="min-h-11 rounded-control px-4 type-body-small font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:text-text-tertiary"
            disabled={status === "loadingMore"}
            onClick={onLoadMore}
            type="button"
          >
            {status === "loadingMore"
              ? "주문내역을 더 불러오는 중이에요"
              : hasLoadMoreError
                ? "다시 불러오기"
                : "주문내역 더 보기"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
