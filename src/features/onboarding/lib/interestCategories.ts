// Onboarding Q3 option labels in seed order (backend V17__seed_onboarding_questions_and_options.sql).
// Search and the recommendation feed take one of these as `category` and reject any other value
// with 400. The list lives here because the onboarding question API needs login and search does not.
// 어린이 is left out: its books are spread over many catalog fields, so the AI cannot filter by it.
export const INTEREST_CATEGORIES = [
  "소설",
  "인문",
  "경제경영",
  "자기계발",
  "에세이",
  "라이프스타일",
  "과학",
  "외국어",
  "철학",
  "역사",
  "여행",
  "사회",
  "IT",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

export function toInterestCategory(value: string | null): InterestCategory | null {
  return INTEREST_CATEGORIES.find((category) => category === value) ?? null;
}
