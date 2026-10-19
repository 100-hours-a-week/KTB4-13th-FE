import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CreateOrderRequestDto,
  CreateOrderResponseDto,
  OrderHistoryEntry,
  OrderHistoryItem,
  OrderHistoryPage,
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
    typeof value.itemId !== "number" ||
    typeof value.itemName !== "string" ||
    (value.thumbnailUrl !== null && typeof value.thumbnailUrl !== "string") ||
    typeof value.author !== "string" ||
    typeof value.quantity !== "number" ||
    typeof value.unitPrice !== "number" ||
    typeof value.totalPrice !== "number"
  ) {
    return null;
  }

  return {
    author: value.author,
    itemName: value.itemName,
    productId: value.itemId,
    quantity: value.quantity,
    thumbnailUrl: value.thumbnailUrl,
    totalPrice: value.totalPrice,
    unitPrice: value.unitPrice,
  };
}

function parseOrderHistoryEntry(value: unknown): OrderHistoryEntry | null {
  if (
    !isRecord(value) ||
    typeof value.key !== "string" ||
    typeof value.name !== "string" ||
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

  return {
    createdAt: value.createdAt,
    items: items.filter((item): item is OrderHistoryItem => item !== null),
    key: value.key,
    name: value.name,
    status: value.status,
    totalPrice: value.totalPrice,
  };
}

async function fetchOrderDetail(
  orderKey: string,
  signal?: AbortSignal,
): Promise<OrderHistoryEntry | null> {
  const result = await parseApiResponse(
    await fetchWithAuth(`/api/v1/orders/${encodeURIComponent(orderKey)}`, {
      signal,
    }),
  );

  return result.ok ? parseOrderHistoryEntry(result.data) : null;
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
      isRecord(order) && typeof order.key === "string" ? [order.key] : [],
    );
    if (keys.length !== result.data.orders.length) {
      return { ok: false, reason: "error" };
    }

    const orders = await Promise.all(
      keys.map((key) => fetchOrderDetail(key, signal)),
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
