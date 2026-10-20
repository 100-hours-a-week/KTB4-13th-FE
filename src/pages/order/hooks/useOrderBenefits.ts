import { useEffect, useState } from "react";

import { fetchOwnedCoupons, fetchPointSummary } from "@/features/benefit/api/benefitApi";
import type { OwnedCoupon } from "@/features/benefit/types/benefit";
import { fetchProductDetail } from "@/features/product/api/productDetailApi";

export type OrderBenefitsState =
  | { kind: "loading" }
  | { balance: number; coupons: OwnedCoupon[]; kind: "ready" }
  | { kind: "error" };

export function useOrderBenefits(productIdsKey: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<OrderBenefitsState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const productIds = productIdsKey.split(",").map(Number).filter((id) => Number.isSafeInteger(id) && id > 0);
    void Promise.all([
      fetchOwnedCoupons(controller.signal),
      fetchPointSummary(controller.signal),
      Promise.all(productIds.map((productId) => fetchProductDetail(productId, controller.signal))),
    ]).then(([coupons, points, products]) => {
      if (controller.signal.aborted) return;
      const areProductsReady = products.every((product) => product.ok);
      const applicableCouponIds = new Set(
        products.flatMap((product) => product.ok ? product.data.couponIds : []),
      );
      setState(
        coupons.ok && points.ok && areProductsReady
          ? {
              balance: points.data.balance,
              coupons: coupons.data.filter((coupon) => applicableCouponIds.has(coupon.id)),
              kind: "ready",
            }
          : { kind: "error" },
      );
    });
    return () => controller.abort();
  }, [productIdsKey, requestKey]);

  return {
    retry: () => {
      setState({ kind: "loading" });
      setRequestKey((value) => value + 1);
    },
    state,
  };
}
