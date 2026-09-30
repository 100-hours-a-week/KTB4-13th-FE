import { useEffect, useState } from "react";

import { fetchProductDetail } from "@/features/product/api/productDetailApi";
import type { ProductDetail } from "@/features/product/types/product";

export type ProductDetailState =
  | { kind: "loading" }
  | { data: ProductDetail; kind: "ready" }
  | { kind: "not-found" }
  | { kind: "error" };

interface StoredRequestState {
  requestKey: string;
  state: ProductDetailState;
}

export function useProductDetail(productId: number | null) {
  const [retryCount, setRetryCount] = useState(0);
  const [stored, setStored] = useState<StoredRequestState>({
    requestKey: "",
    state: { kind: "loading" },
  });
  const requestKey = `${productId ?? "invalid"}:${retryCount}`;

  useEffect(() => {
    if (productId === null) {
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

      setStored({
        requestKey,
        state: { kind: result.reason === "not-found" ? "not-found" : "error" },
      });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [productId, requestKey]);

  let state: ProductDetailState;

  if (productId === null) {
    state = { kind: "not-found" };
  } else if (stored.requestKey !== requestKey) {
    state = { kind: "loading" };
  } else {
    state = stored.state;
  }

  const retry = () => {
    setRetryCount((current) => current + 1);
  };

  return { retry, state };
}
