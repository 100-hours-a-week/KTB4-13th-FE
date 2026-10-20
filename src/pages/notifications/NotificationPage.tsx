import { useEffect, useState } from "react";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  fetchNotifications,
  readNotification,
} from "@/features/notification/api/notificationApi";
import type { NotificationItem } from "@/features/notification/types/notification";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

export function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [requestKey, setRequestKey] = useState(0);
  const [readingIds, setReadingIds] = useState<number[]>([]);
  const [readError, setReadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetchNotifications(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });
    return () => controller.abort();
  }, [requestKey]);

  const handleRead = async (notification: NotificationItem) => {
    if (notification.readAt !== null || readingIds.includes(notification.notificationId)) return;
    setReadingIds((ids) => [...ids, notification.notificationId]);
    setReadError(false);
    const result = await readNotification(notification.notificationId);
    setReadingIds((ids) => ids.filter((id) => id !== notification.notificationId));
    if (!result.ok) {
      setReadError(true);
      return;
    }
    setNotifications((items) =>
      items.map((item) =>
        item.notificationId === notification.notificationId
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/" title="알림" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="page-content flex min-h-14 items-center justify-between border-b border-hairline">
          <strong className="type-body">최근 알림</strong>
          {status === "ready" ? <span className="type-caption text-text-tertiary">읽지 않음 {unreadCount}</span> : null}
        </div>
        {readError ? <div className="page-content pt-4"><Toast variant="error">알림을 읽음 처리하지 못했어요.</Toast></div> : null}
        {status === "loading" ? (
          <div aria-busy="true" className="page-content space-y-3 py-5" role="status">
            <span className="sr-only">알림을 불러오는 중이에요</span>
            {Array.from({ length: 4 }, (_, index) => <div className="h-24 animate-pulse rounded-panel bg-muted" key={index} />)}
          </div>
        ) : null}
        {status === "error" ? (
          <section className="page-content flex min-h-80 flex-col items-center justify-center text-center">
            <h2 className="type-title">알림을 불러오지 못했어요</h2>
            <p className="mt-2 type-body-small text-text-tertiary">잠시 후 다시 시도해 주세요.</p>
            <div className="mt-4"><RetryButton onClick={() => { setStatus("loading"); setRequestKey((value) => value + 1); }} /></div>
          </section>
        ) : null}
        {status === "ready" && notifications.length === 0 ? (
          <section className="page-content flex min-h-80 flex-col items-center justify-center text-center">
            <h2 className="type-title">도착한 알림이 없어요</h2>
            <p className="mt-2 type-body-small text-text-tertiary">주문과 추천 소식이 생기면 알려드릴게요.</p>
          </section>
        ) : null}
        {status === "ready" && notifications.length > 0 ? (
          <ul className="divide-y divide-hairline">
            {notifications.map((notification) => {
              const isUnread = notification.readAt === null;
              const isReading = readingIds.includes(notification.notificationId);
              return (
                <li key={notification.notificationId}>
                  <button
                    aria-label={`${notification.title}${isUnread ? ", 읽음 처리" : ", 읽음"}`}
                    className={`page-content w-full py-5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${isUnread ? "bg-accent-soft/50" : "bg-surface"}`}
                    disabled={!isUnread || isReading}
                    onClick={() => { void handleRead(notification); }}
                    type="button"
                  >
                    <span className="flex items-start gap-3">
                      <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${isUnread ? "bg-accent" : "bg-transparent"}`} />
                      <span className="min-w-0 flex-1">
                        <strong className="block type-body">{notification.title}</strong>
                        <span className="mt-1 block whitespace-pre-wrap type-body-small text-text-secondary">{notification.body}</span>
                        <span className="mt-2 block type-caption text-text-tertiary">{formatCreatedAt(notification.createdAt)}</span>
                      </span>
                      {isReading ? <span aria-hidden="true" className="mt-1 size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
      <BottomNavigation />
    </div>
  );
}
