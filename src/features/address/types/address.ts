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

// Mirrors backend UpdateAddressRequest; detailAddress must always be sent, null when empty.
export interface UpdateAddressRequestDto {
  address: string;
  detailAddress: string | null;
  label: string;
  postalCode: string;
}

// Mirrors backend RegisterAddressRequest; the first address becomes the default regardless of isDefault.
export interface RegisterAddressRequestDto extends UpdateAddressRequestDto {
  isDefault: boolean;
}
