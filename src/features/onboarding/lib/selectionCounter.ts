import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

export function formatSelectionCounter(
  selectedCount: number,
  { maxSelection, minSelection }: OnboardingQuestion,
) {
  const maxLabel = maxSelection === null ? "" : ` · 최대 ${maxSelection}개`;

  return `${selectedCount}개 선택 · 최소 ${minSelection}개${maxLabel}`;
}
