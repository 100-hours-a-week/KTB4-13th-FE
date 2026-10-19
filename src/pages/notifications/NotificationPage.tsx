import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BottomNavigation } from "@/common/components/BottomNavigation";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { getMockNotifications, readAllMockNotifications, readMockNotification } from "@/features/notification/mock/mockNotificationRepository";

const relativeFormatter = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
function relativeTime(createdAt: string) {
  const minutes = Math.round((new Date(createdAt).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");
  return relativeFormatter.format(Math.round(hours / 24), "day");
}

export function NotificationPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const items = getMockNotifications();
  const hasUnread = items.some((item) => !item.isRead);
  const refresh = () => setVersion((current) => current + 1);
  void version;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/" title="알림" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="page-content flex min-h-14 items-center justify-end border-b border-hairline">
          <button className="min-h-11 px-1 type-body-small font-semibold text-text-secondary disabled:text-text-disabled" disabled={!hasUnread} onClick={() => { readAllMockNotifications(); refresh(); }} type="button">모두 읽음</button>
        </div>
        {items.length === 0 ? <section className="page-content flex min-h-80 flex-col items-center justify-center text-center"><h2 className="type-title">새로운 알림이 없어요</h2><p className="mt-2 type-body-small text-text-tertiary">새 소식이 도착하면 이곳에 알려드릴게요.</p></section> : <ul className="page-content space-y-3 py-4">
          {items.map((item) => <li key={item.id}><button className={`relative w-full rounded-panel border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${item.isRead ? "border-border bg-surface" : "border-accent/20 bg-accent-soft"}`} onClick={() => { readMockNotification(item.id); refresh(); if (item.link) navigate(item.link); }} type="button"><div className="flex items-start gap-3">{!item.isRead ? <span aria-label="읽지 않음" className="mt-2 size-2 shrink-0 rounded-full bg-accent" /> : <span className="mt-2 size-2 shrink-0" />}<div className="min-w-0"><strong className="type-title text-text-primary">{item.title}</strong><p className="mt-1 type-body-small text-text-secondary">{item.body}</p><time className="mt-2 block type-caption text-text-tertiary" dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time></div></div></button></li>)}
        </ul>}
      </main>
      <BottomNavigation />
    </div>
  );
}
