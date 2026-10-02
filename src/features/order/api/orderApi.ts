import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from "@/features/order/types/order";

export type CreateOrderResult =
  | { data: CreateOrderResponseDto; ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "error" };

function isCreateOrderItemResponse(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "productId") === "number" &&
    typeof Reflect.get(value, "itemName") === "string" &&
    (typeof Reflect.get(value, "thumbnailUrl") === "string" ||
      Reflect.get(value, "thumbnailUrl") === null) &&
    typeof Reflect.get(value, "author") === "string" &&
    typeof Reflect.get(value, "salePrice") === "number" &&
    typeof Reflect.get(value, "discountedPrice") === "number" &&
    typeof Reflect.get(value, "quantity") === "number" &&
    typeof Reflect.get(value, "totalPrice") === "number"
  );
}

function isCreateOrderResponse(value: unknown): value is CreateOrderResponseDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const status = Reflect.get(value, "status");
  const items = Reflect.get(value, "items");

  return (
    typeof Reflect.get(value, "orderKey") === "string" &&
    Reflect.get(value, "orderKey").trim().length > 0 &&
    (status === "ORDER_CREATED" || status === "NO_ADDRESS") &&
    typeof Reflect.get(value, "totalPrice") === "number" &&
    Array.isArray(items) &&
    items.every(isCreateOrderItemResponse)
  );
}

export async function createOrder(
  request: CreateOrderRequestDto,
): Promise<CreateOrderResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/orders/checkout", {
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    if (!result.ok) {
      if (result.status === 401) {
        return { ok: false, reason: "unauthorized" };
      }
      if (result.error?.code === "E8001") {
        return { ok: false, reason: "stock" };
      }
      return { ok: false, reason: "error" };
    }

    return isCreateOrderResponse(result.data)
      ? { data: result.data, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
