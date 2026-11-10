import { createContext } from "react";

import type { CartAddedItem } from "@/features/cart/components/CartAddedNotice";

export interface QuickCartItem extends CartAddedItem {
  productId: number;
}

export const QuickCartContext = createContext<{
  add: (item: QuickCartItem) => Promise<void>;
  isDisabled: boolean;
  pendingProductId: number | null;
} | null>(null);
