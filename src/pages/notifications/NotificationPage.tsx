import { BottomNavigation } from "@/common/components/BottomNavigation";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";

export function NotificationPage() {
  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/" title="알림" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <section className="page-content flex min-h-80 flex-col items-center justify-center text-center">
          <h2 className="type-title">알림 기능을 준비하고 있어요</h2>
          <p className="mt-2 max-w-xs break-keep type-body-small leading-relaxed text-text-tertiary">
            알림 조회와 읽음 처리 API가 준비되면 이곳에서 새 소식을 확인할 수 있어요.
          </p>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
