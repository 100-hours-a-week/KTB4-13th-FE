import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  AddressListResponseDto,
  AddressResponseDto,
  RegisterAddressRequestDto,
  UpdateAddressRequestDto,
  UserAddress,
} from "@/features/address/types/address";

export type AddressListResult =
  | { addresses: UserAddress[]; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

export type AddressMutationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "unauthorized" | "not-found" | "invalid-request" | "error";
    };

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

// The backend answers 403 for a missing or foreign address, and one shared 400 code covers
// the three-address limit, duplicate addresses, and invalid input, so 400 stays generic.
function toMutationFailureReason(status: number) {
  if (status === 401) {
    return "unauthorized" as const;
  }
  if (status === 403) {
    return "not-found" as const;
  }
  if (status === 400) {
    return "invalid-request" as const;
  }
  return "error" as const;
}

async function sendAddressMutation(
  path: string,
  init: RequestInit,
): Promise<AddressMutationResult> {
  try {
    const result = await parseApiResponse(await fetchWithAuth(path, init));

    return result.ok
      ? { ok: true }
      : { ok: false, reason: toMutationFailureReason(result.status) };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function registerUserAddress(
  request: RegisterAddressRequestDto,
): Promise<AddressMutationResult> {
  return sendAddressMutation("/api/v1/user-addresses", {
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export function updateUserAddress(
  addressId: number,
  request: UpdateAddressRequestDto,
): Promise<AddressMutationResult> {
  return sendAddressMutation(`/api/v1/user-addresses/${addressId}`, {
    body: JSON.stringify(request),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
}

export function setDefaultUserAddress(
  addressId: number,
): Promise<AddressMutationResult> {
  return sendAddressMutation(`/api/v1/user-addresses/${addressId}/default`, {
    method: "PUT",
  });
}

// Success is an empty 200 body, which parseApiResponse accepts.
export function deleteUserAddress(
  addressId: number,
): Promise<AddressMutationResult> {
  return sendAddressMutation(`/api/v1/user-addresses/${addressId}`, {
    method: "DELETE",
  });
}
