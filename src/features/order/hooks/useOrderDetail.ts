import { useEffect, useState } from "react";

import { fetchOrderDetail } from "@/features/order/api/orderApi";
import type { OrderHistoryEntry } from "@/features/order/types/order";

type OrderDetailState =
  | { kind: "loading" }
  | { data: OrderHistoryEntry; kind: "ready" }
  | { kind: "error" };

export function useOrderDetail(orderKey: string | null) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<OrderDetailState>({ kind: "loading" });

  useEffect(() => {
    if (!orderKey) {
      return undefined;
    }
    const controller = new AbortController();
    void fetchOrderDetail(orderKey, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState(result.ok ? { data: result.data, kind: "ready" } : { kind: "error" });
    });
    return () => controller.abort();
  }, [orderKey, requestKey]);

  return {
    retry: () => {
      setState({ kind: "loading" });
      setRequestKey((value) => value + 1);
    },
    state: orderKey ? state : ({ kind: "error" } as const),
  };
}
