import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import {
  deleteAllMyMemories,
  deleteMyMemories,
  fetchMyPreferences,
} from "@/features/preferences/api/preferencesApi";
import type { UserMemoryGroup } from "@/features/preferences/types/preferences";

type PageState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { items: UserMemoryGroup[]; kind: "ready" };

export function PreferenceEditPage() {
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [requestKey, setRequestKey] = useState(0);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchMyPreferences(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setState({ items: result.data.memories, kind: "ready" });
        return;
      }
      setState({
        kind: "error",
        message:
          result.reason === "not-ready"
            ? "온보딩을 완료하면 취향 정보를 확인할 수 있어요"
            : "취향 정보를 불러오지 못했어요",
      });
    });
    return () => controller.abort();
  }, [requestKey]);

  const remove = async (item: UserMemoryGroup) => {
    const key = item.memoryIds.join(",");
    if (deletingKey !== null) return;
    setDeletingKey(key);
    setNotice(null);
    const result = await deleteMyMemories(item.memoryIds);
    if (result.ok) {
      setState((current) =>
        current.kind === "ready"
          ? {
              items: current.items.filter(
                (memory) => memory.memoryIds.join(",") !== key,
              ),
              kind: "ready",
            }
          : current,
      );
      setNotice("취향 정보를 삭제했어요.");
    } else {
      setNotice("취향 정보를 삭제하지 못했어요. 다시 시도해 주세요.");
    }
    setDeletingKey(null);
  };

  const clearAll = async () => {
    if (deletingKey !== null) return;
    setDeletingKey("all");
    setNotice(null);
    const result = await deleteAllMyMemories();
    if (result.ok) {
      setState({ items: [], kind: "ready" });
      setNotice("취향 정보를 모두 삭제했어요.");
    } else {
      setNotice("취향 정보를 삭제하지 못했어요. 다시 시도해 주세요.");
    }
    setDeletingKey(null);
    setIsConfirming(false);
  };

  const items = state.kind === "ready" ? state.items : [];

  return <div className="relative flex h-dvh flex-col bg-surface">
    <AppPageHeader fallbackPath="/my" title="취향 정보 수정" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto py-6">
      <h2 className="type-section">북적북적이 기억한<br />나의 독서 취향</h2><p className="mt-2 type-body-small text-text-secondary">원하지 않는 기억은 언제든 지울 수 있어요.</p>
      {notice ? <div className="mt-5"><Toast variant={notice.includes("못했어요") ? "error" : "default"}>{notice}</Toast></div> : null}
      {state.kind === "loading" ? <div aria-busy="true" className="mt-7 space-y-3"><p className="sr-only" role="status">취향 정보를 불러오는 중이에요</p>{Array.from({ length: 3 }, (_, index) => <div aria-hidden="true" className="h-24 animate-pulse rounded-panel border border-border bg-muted" key={index} />)}</div> : null}
      {state.kind === "error" ? <div className="mt-7"><Toast action={<RetryButton onClick={() => { setState({ kind: "loading" }); setRequestKey((value) => value + 1); }} />} variant="error">{state.message}</Toast></div> : null}
      {state.kind === "ready" && items.length ? <ul className="mt-7 space-y-3">{items.map((item) => { const key = item.memoryIds.join(","); return <li className="rounded-panel border border-border p-4" key={key}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><span className="rounded-full bg-muted px-2 py-1 type-caption text-text-secondary">대화에서</span><p className="mt-3 type-body leading-relaxed">{item.value}</p></div><button aria-label="취향 기억 삭제" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-50" disabled={deletingKey !== null} onClick={() => { void remove(item); }} type="button">×</button></div></li>; })}</ul> : null}
      {state.kind === "ready" && !items.length ? <section className="flex min-h-64 flex-col items-center justify-center text-center"><h2 className="type-title">저장된 취향 정보가 없어요</h2><p className="mt-2 type-body-small text-text-tertiary">AI와 대화하면 취향을 다시 채워드려요.</p></section> : null}
      {items.length ? <button className="mt-8 min-h-11 w-full type-body-small font-semibold text-error disabled:cursor-wait disabled:opacity-50" disabled={deletingKey !== null} onClick={() => setIsConfirming(true)} type="button">취향 정보 전체 삭제</button> : null}
    </main>
    <ConfirmDialog confirmLabel="전체 삭제" description="삭제한 정보는 되돌릴 수 없어요." isOpen={isConfirming} onCancel={() => setIsConfirming(false)} onConfirm={() => { void clearAll(); }} title="모든 취향 정보를 지울까요?" />
  </div>;
}
