import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import { formatSelectionCounter } from "@/features/onboarding/lib/selectionCounter";
import { groupSubcategoryOptions } from "@/features/onboarding/lib/subcategoryParentAdapter";
import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

interface SubcategoryStepProps {
  onToggleOption: (optionId: number) => void;
  optionLabelsById: Record<number, string>;
  question: OnboardingQuestion;
  selectedOptionIds: number[];
}

export function SubcategoryStep({
  onToggleOption,
  optionLabelsById,
  question,
  selectedOptionIds,
}: SubcategoryStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={formatSelectionCounter(selectedOptionIds.length, question)}
        title={question.content}
      />
      <div className="flex flex-col gap-6">
        {groupSubcategoryOptions(question.options, optionLabelsById).map(
          (group) => (
            <div key={group.key}>
              {group.label ? (
                <h3 className="type-title text-text-primary">{group.label}</h3>
              ) : null}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <SelectableOption
                    isSelected={selectedOptionIds.includes(option.optionId)}
                    key={option.optionId}
                    label={option.content}
                    onSelect={() => onToggleOption(option.optionId)}
                    variant="chip"
                  />
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
