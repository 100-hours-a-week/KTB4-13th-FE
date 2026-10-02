export interface OrderItemViewModel {
  discountedPrice: number;
  itemName: string;
  productId: number;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface OrderNavigationState {
  cartItemIds?: number[];
  items: OrderItemViewModel[];
}

export interface OrderCompleteNavigationState {
  isCartCleanupFailed: boolean;
}

export interface CreateOrderItemRequestDto {
  itemId: number;
  quantity: number;
}

export interface CreateOrderRequestDto {
  addressId: number;
  items: CreateOrderItemRequestDto[];
}

export interface CreateOrderResponseDto {
  orderKey: string;
}
