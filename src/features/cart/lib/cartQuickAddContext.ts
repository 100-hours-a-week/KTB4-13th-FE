import { createContext, useContext } from "react";

export interface QuickAddItem {
  productId: number;
  thumbnailUrl: string | null;
  title: string;
}

export interface CartQuickAddValue {
  addToCart: (item: QuickAddItem) => void;
  isAdding: (productId: number) => boolean;
}

export const CartQuickAddContext = createContext<CartQuickAddValue | null>(null);

// Lists inside BottomNavigationLayout can put a book in the cart without opening its page.
export function useCartQuickAdd() {
  return useContext(CartQuickAddContext);
}
