import { fetchCart } from "@/features/cart/api/cartApi";
import { toCartItemViewModels } from "@/features/cart/lib/toCartItemViewModels";
import { readOrderNavigationState } from "@/features/order/lib/orderNavigation";
import type { OrderNavigationState } from "@/features/order/types/order";
import { fetchAgentCartExecution } from "@/features/recommendation/api/recommendationSessionApi";
import type { ChatCheckout } from "@/pages/recommendation-chat/types/chatPresentation";

export async function loadAgentCheckout(
  checkout: ChatCheckout,
  signal: AbortSignal,
): Promise<
  | { kind: "empty" | "error" }
  | { kind: "ready"; state: OrderNavigationState }
> {
  const [execution, cart] = await Promise.all([
    fetchAgentCartExecution(checkout.executionId, signal),
    fetchCart(signal),
  ]);
  if (!execution.ok || !cart.ok) return { kind: "error" };

  const productIds = new Set(
    execution.data.filter((item) => item.operation === "set").map((item) => item.productId),
  );
  const orderItems = toCartItemViewModels(cart.data).filter(
    (item) => item.isPurchasable && productIds.has(item.productId),
  );
  const state = readOrderNavigationState({
    agentCheckout: {
      couponId: checkout.benefits?.useOwnedCouponId ?? null,
      point: checkout.benefits?.usePoint ?? 0,
    },
    cartItemIds: orderItems.map((item) => item.cartItemId),
    items: orderItems.map((item) => ({
      discountedPrice: item.unitPrice,
      itemName: item.itemName,
      productId: item.productId,
      quantity: item.quantity,
      thumbnailUrl: item.thumbnailUrl,
    })),
  });

  return state ? { kind: "ready", state } : { kind: "empty" };
}
