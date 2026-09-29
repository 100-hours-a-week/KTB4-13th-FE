import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CartItemResponseDto,
  CartResponseDto,
} from "@/features/cart/types/cart";

export type AddCartItemResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "error" };

export type FetchCartResult =
  | { data: CartResponseDto; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

export type DeleteCartItemsResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "not-found" | "error" };

export type UpdateCartItemQuantityResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "not-found" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCartItem(data: unknown): CartItemResponseDto | null {
  if (
    !isRecord(data) ||
    typeof data.cartItemId !== "number" ||
    !Number.isSafeInteger(data.cartItemId) ||
    data.cartItemId <= 0 ||
    typeof data.productId !== "number" ||
    !Number.isSafeInteger(data.productId) ||
    data.productId <= 0 ||
    typeof data.quantity !== "number" ||
    !Number.isInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 500
  ) {
    return null;
  }

  return {
    cartItemId: data.cartItemId,
    productId: data.productId,
    quantity: data.quantity,
  };
}

function parseCartResponse(data: unknown): CartResponseDto | null {
  if (!isRecord(data) || !Array.isArray(data.items)) {
    return null;
  }

  const items = data.items.map(parseCartItem);
  return items.every((item): item is CartItemResponseDto => item !== null)
    ? { items }
    : null;
}

function getFailureReason(status: number) {
  if (status === 401) {
    return "unauthorized" as const;
  }
  if (status === 404) {
    return "not-found" as const;
  }
  return "error" as const;
}

export async function addCartItem(
  productId: number,
  quantity: number,
): Promise<AddCartItemResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/cart/items", {
        body: JSON.stringify({ productId, quantity }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    if (result.ok) {
      return { ok: true };
    }
    if (result.status === 401) {
      return { ok: false, reason: "unauthorized" };
    }
    if (result.error?.code === "E8001") {
      return { ok: false, reason: "stock" };
    }
    return { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function fetchCart(signal?: AbortSignal): Promise<FetchCartResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/cart", { signal }),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }

    const data = parseCartResponse(result.data);
    return data
      ? { data, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

async function requestCartItemDeletion(
  path: string,
  cartItemIds?: number[],
): Promise<DeleteCartItemsResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(path, {
        ...(cartItemIds
          ? {
              body: JSON.stringify({ cartItemIds }),
              headers: { "Content-Type": "application/json" },
            }
          : {}),
        method: "DELETE",
      }),
    );

    return result.ok
      ? { ok: true }
      : { ok: false, reason: getFailureReason(result.status) };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function deleteCartItem(
  cartItemId: number,
): Promise<DeleteCartItemsResult> {
  return requestCartItemDeletion(`/api/v1/cart/items/${cartItemId}`);
}

export function deleteCartItems(
  cartItemIds: number[],
): Promise<DeleteCartItemsResult> {
  return requestCartItemDeletion("/api/v1/cart/items", cartItemIds);
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<UpdateCartItemQuantityResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/cart/items/${cartItemId}`, {
        body: JSON.stringify({ quantity }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
    );

    if (result.ok) {
      return { ok: true };
    }
    if (result.error?.code === "E8001") {
      return { ok: false, reason: "stock" };
    }
    return { ok: false, reason: getFailureReason(result.status) };
  } catch {
    return { ok: false, reason: "error" };
  }
}
