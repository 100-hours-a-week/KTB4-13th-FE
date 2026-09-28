import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOptionList } from "@/features/onboarding/components/SelectableOptionList";
import { bookSelectionCriteria } from "@/features/onboarding/mocks/onboardingMockData";

const MAX_CRITERIA_SELECTION = 3;

interface BookCriteriaStepProps {
  criteriaIds: string[];
  onToggleCriteria: (id: string) => void;
}

export function BookCriteriaStep({
  criteriaIds,
  onToggleCriteria,
}: BookCriteriaStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${criteriaIds.length}/${MAX_CRITERIA_SELECTION}개 선택`}
        title="어떤 기준으로 책을 고르시나요?"
      />
      <SelectableOptionList
        onToggle={onToggleCriteria}
        options={bookSelectionCriteria}
        selectedIds={criteriaIds}
      />
    </div>
  );
}
