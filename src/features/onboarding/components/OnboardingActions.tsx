import type { ReactNode } from "react";

interface OnboardingActionsProps {
  children: ReactNode;
  feedback?: ReactNode;
}

export function OnboardingActions({ children, feedback }: OnboardingActionsProps) {
  return (
    <footer className="safe-area-bottom page-content shrink-0 flex flex-col gap-2 pt-4">
      {feedback ? (
        <p aria-live="polite" className="flex justify-center" role="status">
          <span className="inline-flex items-center gap-1.5 rounded-control bg-accent-soft px-3 py-1.5 type-caption font-medium text-accent">
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white"
            >
              !
            </span>
            {feedback}
          </span>
        </p>
      ) : null}
      <div className="flex flex-col gap-3">{children}</div>
    </footer>
  );
}
