import { useCallback, useEffect, useRef, useState } from "react";

import { fetchOrderHistory } from "@/features/order/api/orderApi";
import type { OrderHistoryEntry } from "@/features/order/types/order";

type OrderHistoryStatus = "loading" | "ready" | "error" | "loadingMore";

interface OrderHistoryState {
  hasLoadMoreError: boolean;
  nextCursor: string | null;
  orders: OrderHistoryEntry[];
  status: OrderHistoryStatus;
}

const INITIAL_STATE: OrderHistoryState = {
  hasLoadMoreError: false,
  nextCursor: null,
  orders: [],
  status: "loading",
};

export function useOrderHistory() {
  const [state, setState] = useState<OrderHistoryState>(INITIAL_STATE);
  const [requestKey, setRequestKey] = useState(0);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;

    void fetchOrderHistory(undefined, controller.signal).then((result) => {
      if (!isActive || requestVersionRef.current !== requestVersion) {
        return;
      }

      setState(
        result.ok
          ? {
              hasLoadMoreError: false,
              nextCursor: result.data.nextCursor,
              orders: result.data.orders,
              status: "ready",
            }
          : { ...INITIAL_STATE, status: "error" },
      );
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestKey]);

  const loadMore = useCallback(() => {
    if (state.nextCursor === null || state.status === "loadingMore") {
      return;
    }

    const requestVersion = requestVersionRef.current;
    const currentCursor = state.nextCursor;
    setState((current) => ({
      ...current,
      hasLoadMoreError: false,
      status: "loadingMore",
    }));

    void fetchOrderHistory(currentCursor).then((result) => {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setState((current) =>
        result.ok
          ? {
              hasLoadMoreError: false,
              nextCursor:
                result.data.nextCursor === currentCursor
                  ? null
                  : result.data.nextCursor,
              orders: [...current.orders, ...result.data.orders],
              status: "ready",
            }
          : {
              ...current,
              hasLoadMoreError: true,
              status: "ready",
            },
      );
    });
  }, [state.nextCursor, state.status]);

  const retry = () => setRequestKey((current) => current + 1);

  return { ...state, loadMore, retry };
}
