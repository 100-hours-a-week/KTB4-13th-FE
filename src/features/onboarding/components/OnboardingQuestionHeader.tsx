import type { ReactNode } from "react";

interface OnboardingQuestionHeaderProps {
  counter: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function OnboardingQuestionHeader({
  counter,
  description,
  title,
}: OnboardingQuestionHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-heading text-text-primary">{title}</h2>
      {description ? (
        <p className="type-caption text-text-secondary">{description}</p>
      ) : null}
      <p className="type-caption text-text-tertiary">{counter}</p>
    </div>
  );
}
