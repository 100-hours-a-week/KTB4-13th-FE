import { useEffect, useState } from "react";

import { fetchOwnedCoupons, fetchPointSummary } from "@/features/benefit/api/benefitApi";
import type { OwnedCoupon } from "@/features/benefit/types/benefit";

export type OrderBenefitsState =
  | { kind: "loading" }
  | { balance: number; coupons: OwnedCoupon[]; kind: "ready" }
  | { kind: "error" };

export function useOrderBenefits() {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<OrderBenefitsState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetchOwnedCoupons(controller.signal),
      fetchPointSummary(controller.signal),
    ]).then(([coupons, points]) => {
      if (controller.signal.aborted) return;
      setState(
        coupons.ok && points.ok
          ? { balance: points.data.balance, coupons: coupons.data, kind: "ready" }
          : { kind: "error" },
      );
    });
    return () => controller.abort();
  }, [requestKey]);

  return {
    retry: () => {
      setState({ kind: "loading" });
      setRequestKey((value) => value + 1);
    },
    state,
  };
}
