import type { ReactNode } from "react";

import { getSelectableSurfaceClassName } from "@/features/onboarding/lib/selectionStyles";

export type SelectableVariant = "row" | "tile" | "chip";

interface SelectableOptionProps {
  isSelected: boolean;
  label: ReactNode;
  onSelect: () => void;
  variant: SelectableVariant;
}

// row/tile: 1~3단계 리스트·그리드가 같은 높이·패딩을 갖도록 하는 공통 규격.
// chip: 4단계 세부 카테고리용 compact 규격.
const variantClassName: Record<SelectableVariant, string> = {
  row: "flex min-h-[3.25rem] w-full items-center gap-3 rounded-control px-4 py-3 text-left",
  tile: "flex min-h-[3.25rem] items-center justify-center rounded-control px-4 py-3 text-center",
  chip: "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-center",
};

export function SelectableOption({
  isSelected,
  label,
  onSelect,
  variant,
}: SelectableOptionProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={`border type-body-small transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variantClassName[variant]} ${getSelectableSurfaceClassName(isSelected)}`}
      onClick={onSelect}
      type="button"
    >
      {variant === "row" ? (
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
            isSelected
              ? "border-accent bg-accent text-white"
              : "border-border-strong text-transparent"
          }`}
        >
          ✓
        </span>
      ) : null}
      <span className={variant === "row" ? "min-w-0 flex-1" : undefined}>
        {label}
      </span>
    </button>
  );
}
