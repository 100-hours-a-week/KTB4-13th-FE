import type {
  CartItemViewModel,
  CartResponseDto,
} from "@/features/cart/types/cart";

const MISSING_ITEM_NAME = "상품 정보를 찾을 수 없어요";

export function toCartItemViewModels(
  response: CartResponseDto,
): CartItemViewModel[] {
  return response.items.map((item) => {
    const unitPrice = item.discountedPrice ?? item.salePrice;

    return {
      cartItemId: item.cartItemId,
      isPurchasable: item.isAvailableForPurchase && unitPrice !== null,
      itemName: item.itemName ?? MISSING_ITEM_NAME,
      productId: item.productId,
      quantity: item.quantity,
      thumbnailUrl: item.thumbnailUrl,
      unitPrice: unitPrice ?? 0,
    };
  });
}
