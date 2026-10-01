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
