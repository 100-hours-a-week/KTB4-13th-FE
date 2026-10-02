export function getSelectableSurfaceClassName(isSelected: boolean): string {
  return isSelected
    ? "border-text-primary bg-surface text-text-primary font-semibold"
    : "border-border bg-surface text-text-secondary font-medium hover:border-border-strong";
}
