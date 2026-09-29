import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  AddressListResponseDto,
  AddressResponseDto,
  UserAddress,
} from "@/features/order/types/order";

export type AddressListResult =
  | { addresses: UserAddress[]; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAddressResponseDto(value: unknown): value is AddressResponseDto {
  return (
    isRecord(value) &&
    typeof value.addressid === "number" &&
    typeof value.addressLabel === "string" &&
    typeof value.addressPostalCode === "string" &&
    typeof value.address === "string" &&
    (value.detailAddress === null ||
      typeof value.detailAddress === "string") &&
    typeof value.isDefault === "boolean"
  );
}

function parseAddressListResponse(
  value: unknown,
): AddressListResponseDto | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.addresses) ||
    !value.addresses.every(isAddressResponseDto) ||
    (value.nextCursor !== null && typeof value.nextCursor !== "string")
  ) {
    return null;
  }

  return {
    addresses: value.addresses,
    nextCursor: value.nextCursor,
  };
}

function toUserAddress(address: AddressResponseDto): UserAddress {
  return {
    address: address.address,
    addressId: address.addressid,
    detailAddress: address.detailAddress,
    isDefault: address.isDefault,
    label: address.addressLabel,
    postalCode: address.addressPostalCode,
  };
}

export async function fetchUserAddresses(
  signal?: AbortSignal,
): Promise<AddressListResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/user-addresses", { signal }),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }

    const data = parseAddressListResponse(result.data);
    return data
      ? { addresses: data.addresses.map(toUserAddress), ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
