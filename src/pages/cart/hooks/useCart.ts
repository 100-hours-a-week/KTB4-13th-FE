import { useEffect, useRef, useState } from "react";

import {
  deleteCartItem,
  deleteCartItems,
  fetchCart,
  updateCartItemQuantity,
} from "@/features/cart/api/cartApi";
import type { DeleteCartItemsResult } from "@/features/cart/api/cartApi";
import { toCartItemViewModels } from "@/features/cart/lib/toCartItemViewModels";
import type { CartItemViewModel } from "@/features/cart/types/cart";

export type CartState =
  | { kind: "loading" }
  | { kind: "error" }
  | { items: CartItemViewModel[]; kind: "ready" };

interface StoredCartState {
  requestKey: number;
  state: CartState;
}

type CartMutation =
  | { cartItemId: number; kind: "quantity" }
  | { kind: "delete" };

export function useCart() {
  const [requestKey, setRequestKey] = useState(0);
  const [stored, setStored] = useState<StoredCartState>({
    requestKey: -1,
    state: { kind: "loading" },
  });
  const [mutation, setMutation] = useState<CartMutation | null>(null);
  const mutationLockRef = useRef(false);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    void fetchCart(controller.signal).then((result) => {
      if (!isActive) {
        return;
      }

      if (!result.ok) {
        setStored({ requestKey, state: { kind: "error" } });
        return;
      }

      setStored({
        requestKey,
        state: { items: toCartItemViewModels(result.data), kind: "ready" },
      });
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestKey]);

  const retry = () => setRequestKey((current) => current + 1);

  const changeQuantity = async (cartItemId: number, quantity: number) => {
    if (
      mutationLockRef.current ||
      quantity < 1 ||
      quantity > 99 ||
      stored.requestKey !== requestKey ||
      stored.state.kind !== "ready"
    ) {
      return false;
    }

    mutationLockRef.current = true;
    setMutation({ cartItemId, kind: "quantity" });

    try {
      const result = await updateCartItemQuantity(cartItemId, quantity);

      if (!result.ok) {
        retry();
        return false;
      }

      setStored((current) => {
        if (
          current.requestKey !== requestKey ||
          current.state.kind !== "ready"
        ) {
          return current;
        }

        return {
          requestKey,
          state: {
            items: current.state.items.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity } : item,
            ),
            kind: "ready",
          },
        };
      });
      return true;
    } finally {
      mutationLockRef.current = false;
      setMutation(null);
    }
  };

  const runDelete = async (
    cartItemIds: number[],
    request: () => Promise<DeleteCartItemsResult>,
  ) => {
    if (
      mutationLockRef.current ||
      cartItemIds.length === 0 ||
      stored.requestKey !== requestKey ||
      stored.state.kind !== "ready"
    ) {
      return false;
    }

    mutationLockRef.current = true;
    setMutation({ kind: "delete" });

    try {
      const result = await request();

      if (!result.ok) {
        return false;
      }

      retry();
      return true;
    } finally {
      mutationLockRef.current = false;
      setMutation(null);
    }
  };

  const removeItem = (cartItemId: number) =>
    runDelete([cartItemId], () => deleteCartItem(cartItemId));

  const removeItems = (cartItemIds: number[]) =>
    runDelete(cartItemIds, () => deleteCartItems(cartItemIds));

  const state =
    stored.requestKey === requestKey ? stored.state : { kind: "loading" as const };

  return {
    changeQuantity,
    isDeleting: mutation?.kind === "delete",
    isMutating: mutation !== null,
    removeItem,
    removeItems,
    retry,
    state,
    updatingCartItemId:
      mutation?.kind === "quantity" ? mutation.cartItemId : null,
  };
}
