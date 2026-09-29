export interface CartItemResponseDto {
  cartItemId: number;
  productId: number;
  quantity: number;
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
