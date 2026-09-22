import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import { subcategoryMap } from "@/features/onboarding/mocks/onboardingMockData";
import type { Category } from "@/features/onboarding/types/onboarding";

const MIN_SUBCATEGORY_SELECTION = 1;
const MAX_SUBCATEGORY_SELECTION = 9;

interface SubcategoryStepProps {
  onToggleSubcategory: (id: string) => void;
  selectedMainCategories: Category[];
  subcategoryIds: string[];
}

export function SubcategoryStep({
  onToggleSubcategory,
  selectedMainCategories,
  subcategoryIds,
}: SubcategoryStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${subcategoryIds.length}개 선택 · 최소 ${MIN_SUBCATEGORY_SELECTION}개 · 최대 ${MAX_SUBCATEGORY_SELECTION}개`}
        title={
          <>
            더 나은 맞춤 추천을 위해,
            <br />
            세부 카테고리를 선택해 주세요
          </>
        }
      />
      <div className="flex flex-col gap-6">
        {selectedMainCategories.map((category) => (
          <div key={category.id}>
            <h3 className="type-title text-text-primary">{category.label}</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(subcategoryMap[category.id] ?? []).map((subcategory) => (
                <SelectableOption
                  isSelected={subcategoryIds.includes(subcategory.id)}
                  key={subcategory.id}
                  label={subcategory.label}
                  onSelect={() => onToggleSubcategory(subcategory.id)}
                  variant="chip"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
