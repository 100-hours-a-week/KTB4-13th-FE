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

const timeFormatter = new Intl.DateTimeFormat("ko-KR", { timeStyle: "short" });
const dayFormatter = new Intl.DateTimeFormat("ko-KR", { day: "numeric", month: "long" });
const fullDateFormatter = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" });

// Today shows the time, this year the date, older items the full date.
function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return timeFormatter.format(date);
  return date.getFullYear() === now.getFullYear() ? dayFormatter.format(date) : fullDateFormatter.format(date);
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
        <div className="mx-auto w-full max-w-2xl">
        <div className="page-content flex min-h-11 items-center justify-between border-b border-hairline">
          <strong className="type-body-small font-semibold">최근 알림</strong>
          {status === "ready" ? <span className="type-caption text-text-tertiary">읽지 않음 {unreadCount}</span> : null}
        </div>
        {readError ? <div className="page-content pt-4"><Toast variant="error">알림을 읽음 처리하지 못했어요.</Toast></div> : null}
        {status === "loading" ? (
          <div aria-busy="true" className="divide-y divide-hairline" role="status">
            <span className="sr-only">알림을 불러오는 중이에요</span>
            {Array.from({ length: 6 }, (_, index) => <div aria-hidden="true" className="page-content space-y-2 py-3.5" key={index}><div className="h-4 w-2/5 animate-pulse rounded bg-muted" /><div className="h-4 w-4/5 animate-pulse rounded bg-muted" /></div>)}
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
                    className="page-content block w-full py-3.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:hover:bg-transparent"
                    disabled={!isUnread || isReading}
                    onClick={() => { void handleRead(notification); }}
                    type="button"
                  >
                    <span className="flex items-start gap-2.5">
                      <span aria-hidden="true" className={`mt-1.5 size-1.5 shrink-0 rounded-full ${isUnread ? "bg-accent" : "bg-transparent"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <strong className={`min-w-0 flex-1 break-words type-body-small ${isUnread ? "font-semibold text-text-primary" : "font-medium text-text-secondary"}`}>
                            <span className="sr-only">{isUnread ? "읽지 않음, " : "읽음, "}</span>
                            {notification.title}
                          </strong>
                          <time className="shrink-0 type-caption text-text-tertiary" dateTime={notification.createdAt}>{formatCreatedAt(notification.createdAt)}</time>
                        </span>
                        <span className={`mt-0.5 block whitespace-pre-wrap break-words type-caption ${isUnread ? "text-text-secondary" : "text-text-tertiary"}`}>{notification.body}</span>
                      </span>
                      {isReading ? <span aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" /> : null}
                    </span>
                    {isReading ? <span className="sr-only" role="status">읽음 처리 중</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
