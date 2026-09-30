export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type OnboardingQuestionStep = Exclude<OnboardingStep, 5>;

// Mirrors backend OnboardingProgressResponse (completedAt is not used by the frontend).
export type OnboardingStatus = "IN_PROGRESS" | "COMPLETED";

export interface OnboardingAnswerGroup {
  optionIds: number[];
  questionId: number;
}

export interface OnboardingProgress {
  answers: OnboardingAnswerGroup[];
  bookIds: number[];
  status: OnboardingStatus;
}

// Mirrors backend OnboardingQuestionResponse and OnboardingOptionResponse.
export interface OnboardingOption {
  code: string;
  content: string;
  optionId: number;
  parentOptionId: number | null;
}

export interface OnboardingQuestion {
  content: string;
  maxSelection: number | null;
  minSelection: number;
  nextQuestionId: number | null;
  options: OnboardingOption[];
  questionId: number;
}

export interface BookCandidate {
  author: string;
  bookId: number;
  coverImageUrl: string | null;
  title: string;
}
