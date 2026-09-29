import type {
  CartItemViewModel,
  CartResponseDto,
} from "@/features/cart/types/cart";

export type CartItemViewModelResult =
  | { items: CartItemViewModel[]; ok: true }
  | { ok: false; reason: "missing-product-data" };

export function toCartItemViewModels(
  response: CartResponseDto,
): CartItemViewModelResult {
  if (response.items.length === 0) {
    return { items: [], ok: true };
  }

  return { ok: false, reason: "missing-product-data" };
}
