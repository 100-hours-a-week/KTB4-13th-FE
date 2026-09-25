export interface SelectOption {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface Subcategory {
  id: string;
  label: string;
}

export interface BookPreferenceItem {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;
