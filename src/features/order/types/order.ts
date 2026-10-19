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
  items: CreateOrderItemRequestDto[];
}

export interface CreateOrderItemResponseDto {
  author: string;
  discountedPrice: number;
  itemName: string;
  productId: number;
  quantity: number;
  salePrice: number;
  thumbnailUrl: string | null;
  totalPrice: number;
}

export interface CreateOrderResponseDto {
  items: CreateOrderItemResponseDto[];
  orderKey: string;
  status: "ORDER_CREATED" | "NO_ADDRESS";
  totalPrice: number;
}

export type OrderStatus = "CREATED" | "PAID" | "PARTIAL_CANCELED" | "CANCELED";

export interface OrderHistoryItem {
  author: string;
  itemName: string;
  productId: number;
  quantity: number;
  thumbnailUrl: string | null;
  totalPrice: number;
  unitPrice: number;
}

export interface OrderHistoryEntry {
  createdAt: string;
  items: OrderHistoryItem[];
  key: string;
  name: string;
  status: OrderStatus;
  totalPrice: number;
}

export interface OrderHistoryPage {
  nextCursor: string | null;
  orders: OrderHistoryEntry[];
}
