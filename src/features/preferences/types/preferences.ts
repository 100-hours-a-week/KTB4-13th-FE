export interface OnboardingPreferenceOption {
  name: string;
  optionId: number;
}

export interface OnboardingPreference {
  options: OnboardingPreferenceOption[];
  questionId: number;
}

export interface UserMemoryGroup {
  categories: string[];
  conversationDates: string[];
  memoryIds: number[];
  type: string;
  value: string;
}

export interface UserPreferences {
  memories: UserMemoryGroup[];
  onboarding: OnboardingPreference[];
}
