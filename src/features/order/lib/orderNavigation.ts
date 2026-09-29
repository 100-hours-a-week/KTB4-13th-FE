import type {
  OrderItemViewModel,
  OrderNavigationState,
} from "@/features/order/types/order";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderItemViewModel(value: unknown): value is OrderItemViewModel {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Number.isSafeInteger(value.productId) &&
    Number(value.productId) > 0 &&
    typeof value.itemName === "string" &&
    value.itemName.trim().length > 0 &&
    (value.thumbnailUrl === null || typeof value.thumbnailUrl === "string") &&
    typeof value.discountedPrice === "number" &&
    Number.isFinite(value.discountedPrice) &&
    value.discountedPrice >= 0 &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    Number(value.quantity) <= 99
  );
}

export function readOrderNavigationState(
  value: unknown,
): OrderNavigationState | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    !value.items.every(isOrderItemViewModel)
  ) {
    return null;
  }

  return { items: value.items };
}

export function toCreateOrderItems(items: OrderItemViewModel[]) {
  return items.map((item) => ({
    itemId: item.productId,
    quantity: item.quantity,
  }));
}
