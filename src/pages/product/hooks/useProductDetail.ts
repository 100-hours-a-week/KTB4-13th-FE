import { useEffect, useState } from "react";

import { fetchProductDetail } from "@/features/product/api/productDetailApi";
import type { ProductDetail } from "@/features/product/types/product";
import type { AuthStatus } from "@/features/auth/types/auth";

export type ProductDetailState =
  | { kind: "loading" }
  | { data: ProductDetail; kind: "ready" }
  | { kind: "not-found" }
  | { kind: "authentication-required" }
  | { kind: "error" };

interface StoredRequestState {
  requestKey: string;
  state: ProductDetailState;
}

export function useProductDetail(
  productId: number | null,
  authStatus: AuthStatus,
) {
  const [retryCount, setRetryCount] = useState(0);
  const [stored, setStored] = useState<StoredRequestState>({
    requestKey: "",
    state: { kind: "loading" },
  });
  const requestKey = `${productId ?? "invalid"}:${retryCount}`;

  useEffect(() => {
    if (productId === null || authStatus === "initializing") {
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    void fetchProductDetail(productId, controller.signal).then((result) => {
      if (!isActive) {
        return;
      }

      if (result.ok) {
        setStored({
          requestKey,
          state: { data: result.data, kind: "ready" },
        });
        return;
      }

      const kind =
        result.reason === "not-found"
          ? "not-found"
          : result.reason === "unauthorized"
            ? "authentication-required"
            : "error";
      setStored({ requestKey, state: { kind } });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [authStatus, productId, requestKey]);

  let state: ProductDetailState;

  if (productId === null) {
    state = { kind: "not-found" };
  } else if (authStatus === "initializing" || stored.requestKey !== requestKey) {
    state = { kind: "loading" };
  } else {
    state = stored.state;
  }

  const retry = () => {
    setRetryCount((current) => current + 1);
  };

  return { retry, state };
}
