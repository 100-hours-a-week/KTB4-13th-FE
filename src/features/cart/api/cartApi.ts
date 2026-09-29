import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";

export type AddCartItemResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "error" };

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
