import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import type { OnboardingOption } from "@/features/onboarding/types/onboarding";

interface SelectableOptionListProps {
  onToggle: (optionId: number) => void;
  options: OnboardingOption[];
  selectedIds: number[];
}

export function SelectableOptionList({
  onToggle,
  options,
  selectedIds,
}: SelectableOptionListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {options.map((option) => (
        <li key={option.optionId}>
          <SelectableOption
            isSelected={selectedIds.includes(option.optionId)}
            label={option.content}
            onSelect={() => onToggle(option.optionId)}
            variant="row"
          />
        </li>
      ))}
    </ul>
  );
}
