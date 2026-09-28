import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import { formatSelectionCounter } from "@/features/onboarding/lib/selectionCounter";
import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

interface MainCategoryStepProps {
  onToggleOption: (optionId: number) => void;
  question: OnboardingQuestion;
  selectedOptionIds: number[];
}

export function MainCategoryStep({
  onToggleOption,
  question,
  selectedOptionIds,
}: MainCategoryStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={formatSelectionCounter(selectedOptionIds.length, question)}
        title={question.content}
      />
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option) => (
          <SelectableOption
            isSelected={selectedOptionIds.includes(option.optionId)}
            key={option.optionId}
            label={option.content}
            onSelect={() => onToggleOption(option.optionId)}
            variant="tile"
          />
        ))}
      </div>
    </div>
  );
}
