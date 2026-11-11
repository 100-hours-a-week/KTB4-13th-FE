// Mirrors BE ValidateReviewPolicyUseCase: a PRODUCT review needs a PAID order paid within the last 7 days.
export const REVIEW_WINDOW_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const OFFSET_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;

// BE sends paidAt as a Seoul LocalDateTime without an offset.
function parseServiceDateTime(value: string): number {
  return new Date(OFFSET_PATTERN.test(value) ? value : `${value}+09:00`).getTime();
}

export function isWithinReviewWindow(paidAt: string, now = Date.now()): boolean {
  const paidTime = parseServiceDateTime(paidAt);
  return !Number.isNaN(paidTime) && now - paidTime <= REVIEW_WINDOW_DAYS * DAY_MS;
}
