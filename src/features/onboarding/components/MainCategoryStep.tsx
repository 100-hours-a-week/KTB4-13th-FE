import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import { mainCategories } from "@/features/onboarding/mocks/onboardingMockData";

const MIN_MAIN_CATEGORY_SELECTION = 1;
const MAX_MAIN_CATEGORY_SELECTION = 3;

interface MainCategoryStepProps {
  mainCategoryIds: string[];
  onToggleMainCategory: (id: string) => void;
}

export function MainCategoryStep({
  mainCategoryIds,
  onToggleMainCategory,
}: MainCategoryStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${mainCategoryIds.length}개 선택 · 최소 ${MIN_MAIN_CATEGORY_SELECTION}개 · 최대 ${MAX_MAIN_CATEGORY_SELECTION}개`}
        title="관심있는 카테고리를 선택해 주세요"
      />
      <div className="grid grid-cols-2 gap-3">
        {mainCategories.map((category) => (
          <SelectableOption
            isSelected={mainCategoryIds.includes(category.id)}
            key={category.id}
            label={category.label}
            onSelect={() => onToggleMainCategory(category.id)}
            variant="tile"
          />
        ))}
      </div>
    </div>
  );
}
