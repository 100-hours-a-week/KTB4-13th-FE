import type { OnboardingOption } from "@/features/onboarding/types/onboarding";

// TODO(KTB4-13th-BE#129): Group by the response's parentOptionId and delete this file.
// The Q4 response is already filtered by the saved Q3 answers but does not expose each option's
// parent, so this reuses the Q3-Q4 relation from the former onboarding mock, which the backend
// seed was built from. Options missing here are still shown, just without a group heading.
const MAIN_CATEGORY_LABEL_BY_CODE: Record<string, string> = {
  novel: "소설",
  humanities: "인문",
  business: "경제경영",
  "self-development": "자기계발",
  essay: "에세이",
  lifestyle: "라이프스타일",
  kids: "어린이",
  science: "과학",
  "foreign-language": "외국어",
  philosophy: "철학",
  history: "역사",
  travel: "여행",
  society: "사회",
  it: "IT",
};

const SUBCATEGORY_CODES_BY_MAIN_CATEGORY_CODE: Record<string, string[]> = {
  novel: [
    "novel-thriller",
    "novel-sf",
    "novel-fantasy",
    "novel-korean",
    "novel-japanese",
  ],
  humanities: [
    "humanities-psychology",
    "humanities-reading-writing",
    "humanities-general",
    "humanities-language",
  ],
  business: [
    "business-economy",
    "business-korea-economy",
    "business-finance",
    "business-marketing",
  ],
  "self-development": [
    "self-development-habit",
    "self-development-career",
    "self-development-leadership",
    "self-development-motivation",
  ],
  essay: ["essay-daily", "essay-travel", "essay-people"],
  lifestyle: ["lifestyle-minimal", "lifestyle-interior", "lifestyle-hobby"],
  kids: ["kids-picture-book", "kids-fairy-tale", "kids-comics"],
  science: [
    "science-physics",
    "science-biology",
    "science-space",
    "science-brain",
  ],
  "foreign-language": [
    "foreign-language-english",
    "foreign-language-japanese",
    "foreign-language-chinese",
  ],
  philosophy: ["philosophy-western", "philosophy-eastern", "philosophy-ethics"],
  history: ["history-korea", "history-world", "history-modern"],
  travel: ["travel-domestic", "travel-abroad", "travel-essay"],
  society: ["society-issue", "society-politics", "society-environment"],
  it: ["it-programming", "it-ai", "it-startup", "it-trend"],
};

const MAIN_CATEGORY_CODE_BY_SUBCATEGORY_CODE = new Map(
  Object.entries(SUBCATEGORY_CODES_BY_MAIN_CATEGORY_CODE).flatMap(
    ([mainCategoryCode, subcategoryCodes]) =>
      subcategoryCodes.map((code) => [code, mainCategoryCode] as const),
  ),
);

const UNGROUPED_KEY = "ungrouped";

export interface SubcategoryGroup {
  key: string;
  label: string | null;
  options: OnboardingOption[];
}

export function groupSubcategoryOptions(
  options: OnboardingOption[],
): SubcategoryGroup[] {
  const groups = new Map<string, SubcategoryGroup>();

  for (const option of options) {
    const mainCategoryCode = MAIN_CATEGORY_CODE_BY_SUBCATEGORY_CODE.get(
      option.code,
    );
    const key = mainCategoryCode ?? UNGROUPED_KEY;
    const group = groups.get(key) ?? {
      key,
      label: mainCategoryCode
        ? (MAIN_CATEGORY_LABEL_BY_CODE[mainCategoryCode] ?? null)
        : null,
      options: [],
    };

    group.options.push(option);
    groups.set(key, group);
  }

  return [...groups.values()];
}
