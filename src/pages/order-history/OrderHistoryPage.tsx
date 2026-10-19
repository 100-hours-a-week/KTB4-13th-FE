import { OrderHistoryHeader } from "@/pages/order-history/components/OrderHistoryHeader";
import { OrderHistoryList } from "@/pages/order-history/components/OrderHistoryList";
import { useOrderHistory } from "@/pages/order-history/hooks/useOrderHistory";

export function OrderHistoryPage() {
  const history = useOrderHistory();

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <OrderHistoryHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <OrderHistoryList
          hasLoadMoreError={history.hasLoadMoreError}
          nextCursor={history.nextCursor}
          onLoadMore={history.loadMore}
          onRetry={history.retry}
          orders={history.orders}
          status={history.status}
        />
      </main>
    </div>
  );
}
