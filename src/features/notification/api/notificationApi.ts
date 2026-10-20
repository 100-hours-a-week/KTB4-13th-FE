import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  NotificationItem,
  NotificationList,
} from "@/features/notification/types/notification";

type NotificationFailure = { ok: false; reason: "unauthorized" | "not-found" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNotification(value: unknown): NotificationItem | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.notificationId) ||
    typeof value.title !== "string" ||
    typeof value.body !== "string" ||
    typeof value.createdAt !== "string" ||
    (value.readAt !== null && typeof value.readAt !== "string")
  ) {
    return null;
  }

  return value as unknown as NotificationItem;
}

function failure(status: number): NotificationFailure {
  if (status === 401) return { ok: false, reason: "unauthorized" };
  if (status === 404) return { ok: false, reason: "not-found" };
  return { ok: false, reason: "error" };
}

export async function fetchNotifications(
  signal?: AbortSignal,
): Promise<{ data: NotificationList; ok: true } | NotificationFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/notifications", { signal }),
    );
    if (!result.ok) return failure(result.status);
    if (
      !isRecord(result.data) ||
      !Array.isArray(result.data.notifications) ||
      typeof result.data.unreadCount !== "number" ||
      !Number.isSafeInteger(result.data.unreadCount) ||
      result.data.unreadCount < 0
    ) {
      return { ok: false, reason: "error" };
    }

    const notifications = result.data.notifications.map(parseNotification);
    return notifications.every(
      (notification): notification is NotificationItem => notification !== null,
    )
      ? {
          data: { notifications, unreadCount: result.data.unreadCount },
          ok: true,
        }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function readNotification(
  notificationId: number,
): Promise<{ ok: true } | NotificationFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/notifications/${notificationId}/read`, {
        method: "PATCH",
      }),
    );
    return result.ok ? { ok: true } : failure(result.status);
  } catch {
    return { ok: false, reason: "error" };
  }
}
