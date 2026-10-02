import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import type { OnboardingStep } from "@/features/onboarding/types/onboarding";

interface OnboardingHeaderProps {
  action?: ReactNode;
  onBack: () => void;
  step: OnboardingStep;
  totalSteps: number;
}

export function OnboardingHeader({
  action,
  onBack,
  step,
  totalSteps,
}: OnboardingHeaderProps) {
  const progressPercent = (step / totalSteps) * 100;

  return (
    <header className="page-content shrink-0 pt-4">
      <div className="flex items-center justify-between">
        <button
          aria-label="이전 단계로 이동"
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onBack}
          type="button"
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        {action}
      </div>
      <div
        aria-valuemax={totalSteps}
        aria-valuemin={1}
        aria-valuenow={step}
        className="mt-3 h-0.5 w-full overflow-hidden bg-border"
        role="progressbar"
      >
        <div
          className="h-full bg-text-primary transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
