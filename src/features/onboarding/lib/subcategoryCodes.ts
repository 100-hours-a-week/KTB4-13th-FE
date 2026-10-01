import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

// Maps the saved Q4 optionIds to the option codes the book candidate API expects, using the
// server's Q4 question as the only source. Keeps selection order because the backend sorts
// candidates by it, and returns null when a saved option is no longer offered so no request
// is built from a guessed code.
export function toSubcategoryCodes(
  subcategoryQuestion: OnboardingQuestion,
  selectedOptionIds: number[],
): string[] | null {
  const codeByOptionId = new Map(
    subcategoryQuestion.options.map((option) => [option.optionId, option.code]),
  );
  const subcategoryCodes: string[] = [];

  for (const optionId of selectedOptionIds) {
    const code = codeByOptionId.get(optionId)?.trim();

    if (!code) {
      return null;
    }
    if (!subcategoryCodes.includes(code)) {
      subcategoryCodes.push(code);
    }
  }

  return subcategoryCodes.length > 0 ? subcategoryCodes : null;
}
