import type {
  OnboardingAnswerGroup,
  OnboardingQuestionStep,
  OnboardingStep,
} from "@/features/onboarding/types/onboarding";

// Question IDs come from the backend seed (V17__seed_onboarding_questions_and_options.sql).
// Each step renders a question-specific layout, so the step-to-question mapping is fixed here.
export const QUESTION_ID_BY_STEP: Record<OnboardingQuestionStep, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

const QUESTION_STEPS: OnboardingQuestionStep[] = [1, 2, 3, 4];

export function isQuestionStep(
  step: OnboardingStep,
): step is OnboardingQuestionStep {
  return step !== 5;
}

// The backend does not return a current step, so resume at the first question without a saved answer.
export function getResumeStep(answers: OnboardingAnswerGroup[]): OnboardingStep {
  const answeredQuestionIds = new Set(
    answers
      .filter((answer) => answer.optionIds.length > 0)
      .map((answer) => answer.questionId),
  );

  return (
    QUESTION_STEPS.find(
      (step) => !answeredQuestionIds.has(QUESTION_ID_BY_STEP[step]),
    ) ?? 5
  );
}
