import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import {
  deleteAllMyMemories,
  deleteMyMemories,
  fetchMyPreferences,
} from "@/features/preferences/api/preferencesApi";
import type {
  OnboardingPreference,
  UserMemoryGroup,
} from "@/features/preferences/types/preferences";
import { PreferenceCard, PreferenceRow } from "@/pages/preferences/components/PreferenceCard";

type PageState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { items: UserMemoryGroup[]; kind: "ready"; onboarding: OnboardingPreference[] };

// Question IDs follow the backend onboarding seed (V17); see onboardingSteps.ts.
const QUESTION_LABELS: Record<number, string> = {
  1: "독서 시간",
  2: "선택 기준",
  3: "관심 분야",
  4: "세부 분야",
};

const memoryDateFormatter = new Intl.DateTimeFormat("ko-KR", { day: "numeric", month: "long" });

function formatMemoryMeta(item: UserMemoryGroup) {
  const date = item.conversationDates[0] ? new Date(`${item.conversationDates[0]}T00:00:00`) : null;
  const dateText = date && !Number.isNaN(date.getTime()) ? `${memoryDateFormatter.format(date)} 대화` : "";
  return [dateText, ...item.categories].filter(Boolean).join(" · ");
}

export function PreferenceEditPage() {
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [requestKey, setRequestKey] = useState(0);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const isDeletingRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const location = useLocation();
  // Set by the onboarding edit flow after a successful save.
  const [notice, setNotice] = useState<string | null>(() => {
    const state: unknown = location.state;
    return typeof state === "object" && state !== null && "notice" in state && typeof state.notice === "string" ? state.notice : null;
  });

  useEffect(() => {
    const controller = new AbortController();
    void fetchMyPreferences(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        setState({ items: result.data.memories, kind: "ready", onboarding: result.data.onboarding });
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
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;
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
              onboarding: current.onboarding,
            }
          : current,
      );
      setNotice("취향 정보를 삭제했어요.");
    } else {
      setNotice("취향 정보를 삭제하지 못했어요. 다시 시도해 주세요.");
    }
    isDeletingRef.current = false;
    setDeletingKey(null);
  };

  const clearAll = async () => {
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;
    setDeletingKey("all");
    setNotice(null);
    const result = await deleteAllMyMemories();
    if (result.ok) {
      setState((current) => current.kind === "ready" ? { ...current, items: [] } : current);
      setNotice("AI가 기억한 취향을 모두 삭제했어요.");
    } else {
      setNotice("취향 정보를 삭제하지 못했어요. 다시 시도해 주세요.");
    }
    isDeletingRef.current = false;
    setDeletingKey(null);
    setIsConfirming(false);
  };

  const items = state.kind === "ready" ? state.items : [];
  const onboarding = state.kind === "ready" ? [...state.onboarding].sort((a, b) => a.questionId - b.questionId) : [];

  return <div className="relative flex h-dvh flex-col bg-surface">
    <AppPageHeader fallbackPath="/my" title="취향 정보 수정" />
    <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
      <div className="mx-auto w-full max-w-2xl">
      <h2 className="type-section">나의 독서 취향</h2>
      <p className="mt-1 type-body-small text-text-secondary">북적북적이 추천할 때 참고하는 정보예요.</p>
      {notice ? <div className="mt-4"><Toast variant={notice.includes("못했어요") ? "error" : "default"}>{notice}</Toast></div> : null}
      {state.kind === "error" ? <div className="mt-4"><Toast action={<RetryButton onClick={() => { setState({ kind: "loading" }); setRequestKey((value) => value + 1); }} />} variant="error">{state.message}</Toast></div> : null}

      <section aria-labelledby="base-preference-title" className="mt-6">
        <SectionHeader action={<Link className={SECTION_ACTION_CLASS_NAME} to="/my/preferences/onboarding">온보딩 다시 하기</Link>} description="온보딩 답변이에요. 삭제 대신 다시 설정할 수 있어요." id="base-preference-title" title="기본 취향 정보" />
        {state.kind === "loading" ? <PreferenceSkeleton count={4} label="기본 취향 정보를 불러오는 중이에요" /> : null}
        {state.kind === "ready" && onboarding.length ? <PreferenceCard>{onboarding.map((answer) => <PreferenceRow key={answer.questionId} label={QUESTION_LABELS[answer.questionId] ?? "기타 답변"}><ul aria-label={QUESTION_LABELS[answer.questionId] ?? "기타 답변"} className="flex flex-wrap gap-1">{answer.options.map((option) => <li className="rounded-full bg-muted px-2 py-0.5 type-caption text-text-secondary" key={option.optionId}>{option.name}</li>)}</ul></PreferenceRow>)}</PreferenceCard> : null}
        {state.kind === "ready" && !onboarding.length ? <EmptyCard description="온보딩에 답하면 기본 취향으로 저장돼요." title="저장된 기본 취향이 없어요" /> : null}
      </section>

      <section aria-labelledby="memory-preference-title" className="mt-7">
        <SectionHeader action={state.kind === "ready" && items.length ? <button className={`${SECTION_ACTION_CLASS_NAME} text-error disabled:cursor-wait disabled:opacity-50`} disabled={deletingKey !== null} onClick={() => setIsConfirming(true)} type="button">전체 삭제</button> : null} count={state.kind === "ready" && items.length ? items.length : undefined} description="AI와 대화하며 기억한 내용이에요. 원하지 않으면 지울 수 있어요." id="memory-preference-title" title="AI가 기억한 취향" />
        {state.kind === "loading" ? <PreferenceSkeleton count={3} label="AI가 기억한 취향을 불러오는 중이에요" /> : null}
        {state.kind === "ready" && items.length ? <PreferenceCard>{items.map((item) => { const key = item.memoryIds.join(","); const meta = formatMemoryMeta(item); return <PreferenceRow action={<button aria-label={`${item.value} 삭제`} className="-my-2 -mr-2 inline-flex min-h-11 shrink-0 items-center rounded-control px-2 type-caption font-semibold text-text-tertiary hover:bg-muted hover:text-error focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-50" disabled={deletingKey !== null} onClick={() => { void remove(item); }} type="button">{deletingKey === key ? "삭제 중" : "삭제"}</button>} key={key}><p className="break-words type-body-small text-text-primary">{item.value}</p>{meta ? <p className="mt-0.5 type-caption text-text-tertiary">{meta}</p> : null}</PreferenceRow>; })}</PreferenceCard> : null}
        {state.kind === "ready" && !items.length ? <EmptyCard description="AI와 대화하면 취향을 기억해 추천에 반영해요." title="아직 기억한 취향이 없어요" /> : null}
      </section>
      </div>
    </main>
    <ConfirmDialog confirmLabel="전체 삭제" description="기본 취향 정보는 유지돼요. 삭제한 기억은 되돌릴 수 없어요." isOpen={isConfirming} onCancel={() => setIsConfirming(false)} onConfirm={() => { void clearAll(); }} title="AI가 기억한 취향을 모두 지울까요?" />
  </div>;
}

const SECTION_ACTION_CLASS_NAME = "-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-control px-2 type-caption font-semibold text-text-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary";

interface SectionHeaderProps {
  action?: ReactNode;
  count?: number;
  description: string;
  id: string;
  title: string;
}

function SectionHeader({ action, count, description, id, title }: SectionHeaderProps) {
  return <div className="flex items-start justify-between gap-3"><div className="min-w-0 pt-2"><h3 className="type-title" id={id}>{title}{count ? <span className="ml-1 text-text-tertiary">{count}</span> : null}</h3><p className="mt-0.5 type-caption text-text-tertiary">{description}</p></div>{action}</div>;
}

function PreferenceSkeleton({ count, label }: { count: number; label: string }) {
  return <div aria-busy="true" className="mt-3 divide-y divide-hairline rounded-panel border border-border"><p className="sr-only" role="status">{label}</p>{Array.from({ length: count }, (_, index) => <div aria-hidden="true" className="px-4 py-3" key={index}><div className="h-5 animate-pulse rounded bg-muted" /></div>)}</div>;
}

function EmptyCard({ description, title }: { description: string; title: string }) {
  return <div className="mt-3 rounded-panel border border-dashed border-border px-4 py-5 text-center"><p className="type-body font-semibold">{title}</p><p className="mt-1 type-caption text-text-tertiary">{description}</p></div>;
}
