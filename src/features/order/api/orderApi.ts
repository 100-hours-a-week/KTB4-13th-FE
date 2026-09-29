import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
} from "@/features/order/types/order";

export type CreateOrderResult =
  | { data: CreateOrderResponseDto; ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "error" };

function isCreateOrderResponse(value: unknown): value is CreateOrderResponseDto {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "orderKey") === "string" &&
    Reflect.get(value, "orderKey").trim().length > 0
  );
}

export async function createOrder(
  request: CreateOrderRequestDto,
): Promise<CreateOrderResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/orders", {
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
