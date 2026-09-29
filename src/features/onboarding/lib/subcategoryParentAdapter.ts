import type { OnboardingOption } from "@/features/onboarding/types/onboarding";

const UNGROUPED_KEY = "ungrouped";

export interface SubcategoryGroup {
  key: string;
  label: string | null;
  options: OnboardingOption[];
}

export function groupSubcategoryOptions(
  options: OnboardingOption[],
  optionLabelsById: Record<number, string>,
): SubcategoryGroup[] {
  const groups = new Map<string, SubcategoryGroup>();

  for (const option of options) {
    const { parentOptionId } = option;
    const key = parentOptionId === null ? UNGROUPED_KEY : String(parentOptionId);
    const group = groups.get(key) ?? {
      key,
      label:
        parentOptionId === null
          ? null
          : (optionLabelsById[parentOptionId] ?? null),
      options: [],
    };

    group.options.push(option);
    groups.set(key, group);
  }

  return [...groups.values()];
}
