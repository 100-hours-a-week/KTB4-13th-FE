import type { ReactNode } from "react";

interface PreferenceCardProps {
  action?: ReactNode;
  badge: string;
  children: ReactNode;
  meta?: string;
  tone?: "base" | "memory";
}

// Shared card shell so onboarding answers and AI memories read as one list; only the action differs.
export function PreferenceCard({ action, badge, children, meta, tone = "memory" }: PreferenceCardProps) {
  return (
    <li className="rounded-panel border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`rounded-full px-2 py-0.5 type-caption font-semibold ${tone === "base" ? "bg-muted text-text-secondary" : "bg-accent-soft text-accent"}`}>{badge}</span>
            {meta ? <span className="type-caption text-text-tertiary">{meta}</span> : null}
          </div>
          <div className="mt-3">{children}</div>
        </div>
        {action}
      </div>
    </li>
  );
}
