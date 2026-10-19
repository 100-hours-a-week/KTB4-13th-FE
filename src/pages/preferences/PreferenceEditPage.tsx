import { useEffect, useRef, useState } from "react";

import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { clearMockPreferences, deleteMockPreference, getMockPreferences, restoreMockPreference, type MockPreference } from "@/features/preferences/mock/mockPreferenceRepository";

export function PreferenceEditPage() {
  const [version, setVersion] = useState(0);
  const [lastDeleted, setLastDeleted] = useState<MockPreference | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);
  const items = getMockPreferences();
  void version;
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  const remove = (id: string) => { const deleted = deleteMockPreference(id); if (!deleted) return; setLastDeleted(deleted); setVersion((v) => v + 1); if (timerRef.current) window.clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => setLastDeleted(null), 3000); };
  const undo = () => { if (!lastDeleted) return; restoreMockPreference(lastDeleted); setLastDeleted(null); setVersion((v) => v + 1); };
  return <div className="relative flex h-dvh flex-col bg-surface">
    <AppPageHeader fallbackPath="/my" title="취향 정보 수정" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto py-6">
      <h2 className="type-section">북적북적이 기억한<br />나의 독서 취향</h2><p className="mt-2 type-body-small text-text-secondary">원하지 않는 기억은 언제든 지울 수 있어요.</p>
      {items.length ? <ul className="mt-7 space-y-3">{items.map((item) => <li className="rounded-panel border border-border p-4" key={item.id}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><span className="rounded-full bg-muted px-2 py-1 type-caption text-text-secondary">{item.source}</span><p className="mt-3 type-body leading-relaxed">{item.text}</p></div><button aria-label="취향 기억 삭제" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary" onClick={() => remove(item.id)} type="button">×</button></div></li>)}</ul> : <section className="flex min-h-64 flex-col items-center justify-center text-center"><h2 className="type-title">저장된 취향 정보가 없어요</h2><p className="mt-2 type-body-small text-text-tertiary">AI와 대화하면 취향을 다시 채워드려요.</p></section>}
      {items.length ? <button className="mt-8 min-h-11 w-full type-body-small font-semibold text-error" onClick={() => setIsConfirming(true)} type="button">취향 정보 전체 삭제</button> : null}
    </main>
    {lastDeleted ? <div className="page-content absolute inset-x-0 bottom-5 z-20"><Toast action={<button className="min-h-11 px-2 font-semibold text-accent" onClick={undo} type="button">되돌리기</button>}>취향 정보를 삭제했어요.</Toast></div> : null}
    <ConfirmDialog confirmLabel="전체 삭제" description="삭제한 정보는 되돌릴 수 없어요." isOpen={isConfirming} onCancel={() => setIsConfirming(false)} onConfirm={() => { clearMockPreferences(); setIsConfirming(false); setVersion((v) => v + 1); }} title="모든 취향 정보를 지울까요?" />
  </div>;
}
