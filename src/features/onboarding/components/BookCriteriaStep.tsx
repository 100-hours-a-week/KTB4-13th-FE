import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOptionList } from "@/features/onboarding/components/SelectableOptionList";
import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

interface BookCriteriaStepProps {
  onToggleOption: (optionId: number) => void;
  question: OnboardingQuestion;
  selectedOptionIds: number[];
}

export function BookCriteriaStep({
  onToggleOption,
  question,
  selectedOptionIds,
}: BookCriteriaStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${selectedOptionIds.length}/${question.maxSelection ?? question.options.length}개 선택`}
        title={question.content}
      />
      <SelectableOptionList
        onToggle={onToggleOption}
        options={question.options}
        selectedIds={selectedOptionIds}
      />
    </div>
  );
}
