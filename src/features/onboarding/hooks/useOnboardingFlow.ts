import { useEffect, useState } from "react";

import {
  mainCategories,
  subcategoryMap,
} from "@/features/onboarding/mocks/onboardingMockData";
import type { OnboardingStep } from "@/features/onboarding/types/onboarding";

const TOTAL_STEPS = 5;
const MAX_READING_TIME_SELECTION = 5;
const MAX_CRITERIA_SELECTION = 3;
const MAX_MAIN_CATEGORY_SELECTION = 3;
const MAX_SUBCATEGORY_SELECTION = 9;
const LIMIT_NOTICE_DURATION_MS = 2_000;

function toggleWithLimit(ids: string[], id: string, max: number) {
  if (ids.includes(id)) {
    return { ids: ids.filter((selectedId) => selectedId !== id), limitReached: false };
  }

  if (ids.length >= max) {
    return { ids, limitReached: true };
  }

  return { ids: [...ids, id], limitReached: false };
}

export function useOnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(false);
  const [readingTimeIds, setReadingTimeIds] = useState<string[]>([]);
  const [criteriaIds, setCriteriaIds] = useState<string[]>([]);
  const [mainCategoryIds, setMainCategoryIds] = useState<string[]>([]);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!limitNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLimitNotice(null);
    }, LIMIT_NOTICE_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [limitNotice]);

  const goToNextStep = () => {
    setStep((current) =>
      current < TOTAL_STEPS ? ((current + 1) as OnboardingStep) : current,
    );
  };

  const goToPreviousStep = () => {
    setStep((current) => (current > 1 ? ((current - 1) as OnboardingStep) : current));
  };

  const toggleReadingTime = (id: string) => {
    const result = toggleWithLimit(
      readingTimeIds,
      id,
      MAX_READING_TIME_SELECTION,
    );
    setReadingTimeIds(result.ids);
  };

  const toggleCriteria = (id: string) => {
    const result = toggleWithLimit(criteriaIds, id, MAX_CRITERIA_SELECTION);
    setCriteriaIds(result.ids);
  };

  const toggleMainCategory = (id: string) => {
    if (mainCategoryIds.includes(id)) {
      const removedSubcategoryIds = new Set(
        (subcategoryMap[id] ?? []).map((subcategory) => subcategory.id),
      );

      setMainCategoryIds((current) =>
        current.filter((categoryId) => categoryId !== id),
      );
      // 대분류를 해제하면 그 대분류에 속한 세부 카테고리 선택값도 함께 제거한다.
      setSubcategoryIds((current) =>
        current.filter((subcategoryId) => !removedSubcategoryIds.has(subcategoryId)),
      );
      return;
    }

    const result = toggleWithLimit(
      mainCategoryIds,
      id,
      MAX_MAIN_CATEGORY_SELECTION,
    );

    if (result.limitReached) {
      setLimitNotice("최대 3개까지 선택할 수 있어요");
      return;
    }

    setMainCategoryIds(result.ids);
  };

  const toggleSubcategory = (id: string) => {
    const result = toggleWithLimit(
      subcategoryIds,
      id,
      MAX_SUBCATEGORY_SELECTION,
    );

    if (result.limitReached) {
      setLimitNotice("태그는 최대 9개까지 선택할 수 있어요");
      return;
    }

    setSubcategoryIds(result.ids);
  };

  const toggleBook = (id: string) => {
    setSelectedBookIds((current) =>
      current.includes(id)
        ? current.filter((bookId) => bookId !== id)
        : [...current, id],
    );
  };

  const selectedMainCategories = mainCategories.filter((category) =>
    mainCategoryIds.includes(category.id),
  );

  const isCurrentStepValid = (() => {
    switch (step) {
      case 1:
        return hasAgreedToPrivacy && readingTimeIds.length >= 1;
      case 2:
        return criteriaIds.length >= 1;
      case 3:
        return mainCategoryIds.length >= 1;
      case 4:
        return subcategoryIds.length >= 1;
      case 5:
        return true;
      default:
        return false;
    }
  })();

  return {
    criteriaIds,
    goToNextStep,
    goToPreviousStep,
    hasAgreedToPrivacy,
    isCurrentStepValid,
    limitNotice,
    mainCategoryIds,
    readingTimeIds,
    selectedBookIds,
    selectedMainCategories,
    setHasAgreedToPrivacy,
    step,
    subcategoryIds,
    toggleBook,
    toggleCriteria,
    toggleMainCategory,
    toggleReadingTime,
    toggleSubcategory,
    totalSteps: TOTAL_STEPS,
  };
}
