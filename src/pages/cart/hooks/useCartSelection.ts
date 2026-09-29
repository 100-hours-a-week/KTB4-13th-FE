import { useMemo, useState } from "react";

import type { CartItemViewModel } from "@/features/cart/types/cart";

interface SelectionState {
  cartItemKey: string | null;
  deselectedIds: Set<number>;
}

export function useCartSelection(
  items: CartItemViewModel[],
  isReady: boolean,
) {
  const cartItemIds = useMemo(
    () => new Set(items.map((item) => item.cartItemId)),
    [items],
  );
  const cartItemKey = [...cartItemIds].sort((a, b) => a - b).join(":");
  const selectableIds = items
    .filter((item) => item.isPurchasable)
    .map((item) => item.cartItemId);
  const [stored, setStored] = useState<SelectionState>({
    cartItemKey: null,
    deselectedIds: new Set(),
  });
  let deselectedIds = stored.deselectedIds;

  if (isReady && stored.cartItemKey !== cartItemKey) {
    const hasRemovedItem = [...stored.deselectedIds].some(
      (cartItemId) => !cartItemIds.has(cartItemId),
    );
    deselectedIds = hasRemovedItem
      ? new Set(
          [...stored.deselectedIds].filter((cartItemId) =>
            cartItemIds.has(cartItemId),
          ),
        )
      : stored.deselectedIds;
    setStored({ cartItemKey, deselectedIds });
  }

  const selectedIds = new Set(
    selectableIds.filter((cartItemId) => !deselectedIds.has(cartItemId)),
  );
  const isAllSelected =
    selectableIds.length > 0 && selectedIds.size === selectableIds.length;

  const toggleAll = () => {
    setStored((current) => {
      const deselectedIds = new Set(current.deselectedIds);
      selectableIds.forEach((cartItemId) => {
        if (isAllSelected) {
          deselectedIds.add(cartItemId);
        } else {
          deselectedIds.delete(cartItemId);
        }
      });
      return { ...current, deselectedIds };
    });
  };

  const toggleItem = (cartItemId: number) => {
    if (!selectableIds.includes(cartItemId)) {
      return;
    }

    setStored((current) => {
      const deselectedIds = new Set(current.deselectedIds);
      if (deselectedIds.has(cartItemId)) {
        deselectedIds.delete(cartItemId);
      } else {
        deselectedIds.add(cartItemId);
      }
      return { ...current, deselectedIds };
    });
  };

  return {
    isAllSelected,
    selectableCount: selectableIds.length,
    selectedCount: selectedIds.size,
    selectedIds,
    toggleAll,
    toggleItem,
  };
}
