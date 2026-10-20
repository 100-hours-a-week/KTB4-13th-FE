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

export interface OrderAddress {
  address: string;
  detailAddress: string | null;
  postalCode: string;
}

export interface OrderPayment {
  cancellablePaidAmount: number;
  cancelledPaidAmount: number;
  couponDiscount: number;
  method: string;
  paidAmount: number;
  paidAt: string;
  usedPoint: number;
}

export interface OrderCancellationItem {
  itemName: string;
  orderItemId: number;
  productId: number;
  quantity: number;
}

export interface OrderCancellation {
  canceledAt: string;
  items: OrderCancellationItem[];
  refundedAmount: number;
  type: string;
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

export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "PARTIAL_CANCELED"
  | "CANCELED"
  | "EXPIRED";

export interface OrderHistoryItem {
  author: string;
  canceledQuantity: number;
  itemName: string;
  orderItemId: number;
  productId: number;
  quantity: number;
  status: OrderStatus;
  thumbnailUrl: string | null;
  totalPrice: number;
  unitPrice: number;
}

export interface OrderHistoryEntry {
  address: OrderAddress | null;
  cancellations: OrderCancellation[];
  createdAt: string;
  items: OrderHistoryItem[];
  key: string;
  payment: OrderPayment | null;
  status: OrderStatus;
  totalPrice: number;
}

export interface OrderHistoryPage {
  nextCursor: string | null;
  orders: OrderHistoryEntry[];
}
