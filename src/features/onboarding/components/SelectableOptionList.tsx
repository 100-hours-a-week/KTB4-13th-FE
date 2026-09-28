import { SelectableOption } from "@/features/onboarding/components/SelectableOption";
import type { SelectOption } from "@/features/onboarding/types/onboarding";

interface SelectableOptionListProps {
  onToggle: (id: string) => void;
  options: SelectOption[];
  selectedIds: string[];
}

export function SelectableOptionList({
  onToggle,
  options,
  selectedIds,
}: SelectableOptionListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {options.map((option) => (
        <li key={option.id}>
          <SelectableOption
            isSelected={selectedIds.includes(option.id)}
            label={option.label}
            onSelect={() => onToggle(option.id)}
            variant="row"
          />
        </li>
      ))}
    </ul>
  );
}
