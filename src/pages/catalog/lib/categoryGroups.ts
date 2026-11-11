import type { ProductCategory } from "@/features/product/types/product";

export interface CategoryGroup {
  children: ProductCategory[];
  top: ProductCategory;
}

// /api/v1/categories is a flat list whose path ends in a two-digit library (KDC) code:
// "x0" is a top-level field and "x1".."x9" sit under it, e.g. /categories/80 문학 → /categories/81 한국문학.
const CATEGORY_CODE_PATTERN = /(\d)(\d)$/;
// 총류 (general works) is a catch-all, so it goes last instead of first.
const GENERAL_WORKS_DIGIT = "0";

function groupOrder(digit: string) {
  return digit === GENERAL_WORKS_DIGIT ? 10 : Number(digit);
}

// A category without a code, or a child whose top-level field is missing, has no place in the two rows.
export function groupCategories(categories: ProductCategory[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  const children: { category: ProductCategory; groupDigit: string }[] = [];

  for (const category of categories) {
    const match = CATEGORY_CODE_PATTERN.exec(category.path);
    if (!match) continue;
    const [, groupDigit, subDigit] = match;
    if (subDigit === "0") {
      groups.set(groupDigit, { children: [], top: category });
    } else {
      children.push({ category, groupDigit });
    }
  }
  for (const { category, groupDigit } of children) {
    groups.get(groupDigit)?.children.push(category);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => groupOrder(left) - groupOrder(right))
    .map(([, group]) => group);
}

export function findCategoryGroup(groups: CategoryGroup[], categoryId: number | null) {
  if (categoryId === null) return null;
  return (
    groups.find(
      (group) =>
        group.top.id === categoryId ||
        group.children.some((child) => child.id === categoryId),
    ) ?? null
  );
}
