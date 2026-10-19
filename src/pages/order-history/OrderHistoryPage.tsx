import { OrderHistoryHeader } from "@/pages/order-history/components/OrderHistoryHeader";
import { OrderHistoryList } from "@/pages/order-history/components/OrderHistoryList";
import { useOrderHistory } from "@/pages/order-history/hooks/useOrderHistory";

export function OrderHistoryPage() {
  const location = useLocation();
  const history = useOrderHistory();
  const notice = typeof location.state === "object" && location.state !== null && typeof Reflect.get(location.state, "notice") === "string" ? String(Reflect.get(location.state, "notice")) : null;

  return (
    <div className="relative flex h-dvh min-w-0 flex-col bg-surface">
      <OrderHistoryHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {notice ? <div className="page-content pt-4"><Toast>{notice}</Toast></div> : null}
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
import { useLocation } from "react-router-dom";

import { Toast } from "@/common/components/Toast";
