// Mirrors backend CartItemResponse; product fields are null when the product row is gone.
export interface CartItemResponseDto {
  cartItemId: number;
  discountedPrice: number | null;
  isAvailableForPurchase: boolean;
  itemName: string | null;
  productId: number;
  quantity: number;
  salePrice: number | null;
  thumbnailUrl: string | null;
}

export interface CartResponseDto {
  items: CartItemResponseDto[];
}

export interface CartItemViewModel {
  cartItemId: number;
  isPurchasable: boolean;
  itemName: string;
  productId: number;
  quantity: number;
  thumbnailUrl: string | null;
  unitPrice: number;
}
