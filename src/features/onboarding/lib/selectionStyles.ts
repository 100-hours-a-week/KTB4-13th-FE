export function getSelectableSurfaceClassName(isSelected: boolean): string {
  return isSelected
    ? "border-accent bg-accent-soft text-text-primary font-semibold"
    : "border-border bg-surface text-text-secondary font-medium hover:border-border-strong";
}
