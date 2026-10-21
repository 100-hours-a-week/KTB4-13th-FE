import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
  OrderHistoryEntry,
  OrderHistoryItem,
  OrderHistoryPage,
  OrderAddress,
  OrderCancellation,
  OrderPayment,
  OrderStatus,
} from "@/features/order/types/order";

export type CreateOrderResult =
  | { data: CreateOrderResponseDto; ok: true }
  | { ok: false; reason: "unauthorized" | "stock" | "error" };

export type OrderHistoryResult =
  | { data: OrderHistoryPage; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

const ORDER_STATUSES: OrderStatus[] = [
  "CREATED",
  "PAID",
  "PARTIAL_CANCELED",
  "CANCELED",
  "EXPIRED",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}

function parseOrderHistoryItem(value: unknown): OrderHistoryItem | null {
  if (
    !isRecord(value) ||
    typeof value.orderItemId !== "number" ||
    typeof value.productId !== "number" ||
    typeof value.itemName !== "string" ||
    (value.thumbnailUrl !== null && typeof value.thumbnailUrl !== "string") ||
    typeof value.author !== "string" ||
    typeof value.quantity !== "number" ||
    typeof value.canceledQuantity !== "number" ||
    !isOrderStatus(value.status) ||
    typeof value.unitPrice !== "number" ||
    typeof value.totalPrice !== "number"
  ) {
    return null;
  }

  return {
    author: value.author,
    canceledQuantity: value.canceledQuantity,
    itemName: value.itemName,
    orderItemId: value.orderItemId,
    productId: value.productId,
    quantity: value.quantity,
    status: value.status,
    thumbnailUrl: value.thumbnailUrl,
    totalPrice: value.totalPrice,
    unitPrice: value.unitPrice,
  };
}

function parseOrderHistoryEntry(value: unknown): OrderHistoryEntry | null {
  if (
    !isRecord(value) ||
    typeof value.orderKey !== "string" ||
    typeof value.totalPrice !== "number" ||
    !isOrderStatus(value.status) ||
    !Array.isArray(value.items) ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  const items = value.items.map(parseOrderHistoryItem);
  if (items.some((item) => item === null)) {
    return null;
  }

  const address = parseOrderAddress(value.address);
  const payment = parseOrderPayment(value.payment);
  const cancellations = parseCancellations(value.cancellations);
  if (address === undefined || payment === undefined || cancellations === null) {
    return null;
  }

  return {
    address,
    cancellations,
    createdAt: value.createdAt,
    items: items.filter((item): item is OrderHistoryItem => item !== null),
    key: value.orderKey,
    payment,
    status: value.status,
    totalPrice: value.totalPrice,
  };
}

function parseOrderAddress(value: unknown): OrderAddress | null | undefined {
  if (value === null || value === undefined) return null;
  if (
    !isRecord(value) ||
    typeof value.postalCode !== "string" ||
    typeof value.address !== "string" ||
    (value.detailAddress !== null && typeof value.detailAddress !== "string")
  ) return undefined;
  return {
    address: value.address,
    detailAddress: value.detailAddress,
    postalCode: value.postalCode,
  };
}

function parseOrderPayment(value: unknown): OrderPayment | null | undefined {
  if (value === null || value === undefined) return null;
  if (
    !isRecord(value) ||
    typeof value.couponDiscount !== "number" ||
    typeof value.usedPoint !== "number" ||
    typeof value.paidAmount !== "number" ||
    typeof value.method !== "string" ||
    typeof value.paidAt !== "string" ||
    typeof value.cancelledPaidAmount !== "number" ||
    typeof value.cancellablePaidAmount !== "number"
  ) return undefined;
  return value as unknown as OrderPayment;
}

function parseCancellations(value: unknown): OrderCancellation[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const parsed = value.map((cancellation): OrderCancellation | null => {
    if (
      !isRecord(cancellation) ||
      typeof cancellation.type !== "string" ||
      typeof cancellation.refundedAmount !== "number" ||
      typeof cancellation.canceledAt !== "string" ||
      !Array.isArray(cancellation.items)
    ) return null;
    const items = cancellation.items.map((item) => {
      if (
        !isRecord(item) ||
        typeof item.orderItemId !== "number" ||
        typeof item.productId !== "number" ||
        typeof item.itemName !== "string" ||
        typeof item.quantity !== "number"
      ) return null;
      return item as unknown as OrderCancellation["items"][number];
    });
    return items.every((item): item is OrderCancellation["items"][number] => item !== null)
      ? {
          canceledAt: cancellation.canceledAt,
          items,
          refundedAmount: cancellation.refundedAmount,
          type: cancellation.type,
        }
      : null;
  });
  return parsed.every((item): item is OrderCancellation => item !== null)
    ? parsed
    : null;
}

export async function fetchOrderDetail(
  orderKey: string,
  signal?: AbortSignal,
): Promise<{ data: OrderHistoryEntry; ok: true } | { ok: false }> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/orders/${encodeURIComponent(orderKey)}`, {
        signal,
      }),
    );
    const data = result.ok ? parseOrderHistoryEntry(result.data) : null;
    return data ? { data, ok: true } : { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function fetchOrderHistory(
  cursor?: string,
  signal?: AbortSignal,
): Promise<OrderHistoryResult> {
  const searchParams = new URLSearchParams({ limit: "20" });
  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/orders?${searchParams.toString()}`, {
        signal,
      }),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }
    if (!isRecord(result.data) || !Array.isArray(result.data.orders)) {
      return { ok: false, reason: "error" };
    }

    const keys = result.data.orders.flatMap((order) =>
      isRecord(order) && typeof order.orderKey === "string"
        ? [order.orderKey]
        : [],
    );
    if (keys.length !== result.data.orders.length) {
      return { ok: false, reason: "error" };
    }

    const orders = await Promise.all(
      keys.map(async (key) => {
        const detail = await fetchOrderDetail(key, signal);
        return detail.ok ? detail.data : null;
      }),
    );
    if (orders.some((order) => order === null)) {
      return { ok: false, reason: "error" };
    }

    const nextCursor = result.data.nextCursor;
    if (nextCursor !== null && typeof nextCursor !== "string") {
      return { ok: false, reason: "error" };
    }

    return {
      data: {
        nextCursor,
        orders: orders.filter(
          (order): order is OrderHistoryEntry => order !== null,
        ),
      },
      ok: true,
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function cancelCreatedOrder(orderKey: string) {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/orders/${encodeURIComponent(orderKey)}/cancel`, {
        method: "DELETE",
      }),
    );
    return result.ok ? { ok: true as const } : { ok: false as const };
  } catch {
    return { ok: false as const };
  }
}

type PaidCancellationResult =
  | { ok: true }
  | { message: string | null; ok: false };

async function requestPaidCancellation(
  path: "/api/v1/cancel" | "/api/v1/partial-cancel",
  body: Record<string, number | string>,
): Promise<PaidCancellationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(path, {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );
    return result.ok
      ? { ok: true }
      : { message: result.error?.message?.trim() || null, ok: false };
  } catch {
    return { message: null, ok: false };
  }
}

export function cancelPaidOrder(orderKey: string) {
  return requestPaidCancellation("/api/v1/cancel", { orderKey });
}

export function partiallyCancelPaidOrder(
  orderKey: string,
  orderItemId: number,
  quantity: number,
 ) {
  return requestPaidCancellation("/api/v1/partial-cancel", {
    orderItemId,
    orderKey,
    quantity,
  });
}

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
