import type { ReactNode } from "react";

// Shared grouped card so onboarding answers and AI memories read as one list; only the row action differs.
export function PreferenceCard({ children }: { children: ReactNode }) {
  return <ul className="mt-3 divide-y divide-hairline rounded-panel border border-border bg-surface">{children}</ul>;
}

interface PreferenceRowProps {
  action?: ReactNode;
  children: ReactNode;
  label?: ReactNode;
}

export function PreferenceRow({ action, children, label }: PreferenceRowProps) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      {label ? <span className="w-16 shrink-0 pt-0.5 type-caption font-semibold text-text-tertiary">{label}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </li>
  );
}
