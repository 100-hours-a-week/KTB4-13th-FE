export interface AddressResponseDto {
  address: string;
  addressLabel: string;
  addressPostalCode: string;
  addressid: number;
  detailAddress: string | null;
  isDefault: boolean;
}

export interface AddressListResponseDto {
  addresses: AddressResponseDto[];
  nextCursor: string | null;
}

export interface UserAddress {
  address: string;
  addressId: number;
  detailAddress: string | null;
  isDefault: boolean;
  label: string;
  postalCode: string;
}

export interface OrderItemViewModel {
  discountedPrice: number;
  itemName: string;
  productId: number;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface OrderNavigationState {
  items: OrderItemViewModel[];
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
