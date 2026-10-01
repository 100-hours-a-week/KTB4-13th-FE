import { parseApiResponse } from "@/common/api/apiResponse";
import type { ApiResult } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  BookCandidate,
  OnboardingProgress,
  OnboardingQuestion,
} from "@/features/onboarding/types/onboarding";

// Backend ONBOARDING_NOT_FOUND is exposed only as this code, which other onboarding 404s share.
const ONBOARDING_NOT_STARTED_ERROR_CODE = "E404";

export type OnboardingProgressResult =
  | { kind: "not-started" }
  | { kind: "found"; progress: OnboardingProgress }
  | { kind: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number")
  );
}

function isOnboardingProgress(data: unknown): data is OnboardingProgress {
  return (
    isRecord(data) &&
    (data.status === "IN_PROGRESS" || data.status === "COMPLETED") &&
    Array.isArray(data.answers) &&
    data.answers.every(
      (answer) =>
        isRecord(answer) &&
        typeof answer.questionId === "number" &&
        isNumberArray(answer.optionIds),
    ) &&
    isNumberArray(data.bookIds)
  );
}

function isOnboardingQuestion(data: unknown): data is OnboardingQuestion {
  return (
    isRecord(data) &&
    typeof data.questionId === "number" &&
    typeof data.content === "string" &&
    typeof data.minSelection === "number" &&
    (data.maxSelection === null || typeof data.maxSelection === "number") &&
    (data.nextQuestionId === null || typeof data.nextQuestionId === "number") &&
    Array.isArray(data.options) &&
    data.options.every(
      (option) =>
        isRecord(option) &&
        typeof option.optionId === "number" &&
        (option.parentOptionId === null ||
          typeof option.parentOptionId === "number") &&
        typeof option.code === "string" &&
        typeof option.content === "string",
    )
  );
}

function isBookCandidate(data: unknown): data is BookCandidate {
  return (
    isRecord(data) &&
    typeof data.bookId === "number" &&
    typeof data.title === "string" &&
    typeof data.author === "string" &&
    (data.coverImageUrl === null || typeof data.coverImageUrl === "string")
  );
}

function isBookCandidatesResponse(
  data: unknown,
): data is { candidates: BookCandidate[] } {
  return (
    isRecord(data) &&
    Array.isArray(data.candidates) &&
    data.candidates.every(isBookCandidate)
  );
}

async function requestOnboardingApi(
  path: string,
  init?: RequestInit,
): Promise<ApiResult | null> {
  try {
    return await parseApiResponse(await fetchWithAuth(path, init));
  } catch {
    return null;
  }
}

export async function fetchOnboardingProgress(): Promise<OnboardingProgressResult> {
  const result = await requestOnboardingApi("/api/v1/onboarding");

  if (!result) {
    return { kind: "error" };
  }

  if (!result.ok) {
    // This endpoint raises no other 404, but a bare 404 (e.g. from a proxy) has no backend envelope.
    const isNotStarted =
      result.status === 404 &&
      result.error?.code === ONBOARDING_NOT_STARTED_ERROR_CODE;

    return isNotStarted ? { kind: "not-started" } : { kind: "error" };
  }

  return isOnboardingProgress(result.data)
    ? { kind: "found", progress: result.data }
    : { kind: "error" };
}

export async function fetchOnboardingQuestion(
  questionId: number,
): Promise<OnboardingQuestion | null> {
  const result = await requestOnboardingApi(
    `/api/v1/onboarding/questions/${questionId}`,
  );

  return result?.ok && isOnboardingQuestion(result.data) ? result.data : null;
}

export async function saveOnboardingAnswers(
  questionId: number,
  optionIds: number[],
) {
  const result = await requestOnboardingApi(
    `/api/v1/onboarding/questions/${questionId}/answers`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIds }),
    },
  );

  return result?.ok === true;
}

// The backend binds one comma-separated value to a list, so each code is encoded on its own
// and joined with a literal comma.
export async function fetchOnboardingBookCandidates(
  subcategoryCodes: string[],
): Promise<BookCandidate[] | null> {
  if (subcategoryCodes.length === 0) {
    return null;
  }

  const query = subcategoryCodes.map(encodeURIComponent).join(",");
  const result = await requestOnboardingApi(
    `/api/v1/onboarding/books?subcategoryCodes=${query}`,
  );

  return result?.ok && isBookCandidatesResponse(result.data)
    ? result.data.candidates
    : null;
}

export async function saveOnboardingBooks(bookIds: number[]) {
  const result = await requestOnboardingApi("/api/v1/onboarding/books", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookIds }),
  });

  return result?.ok === true;
}

export async function recordPersonalizationAgreement() {
  const result = await requestOnboardingApi(
    "/api/v1/onboarding/personalization-agreement",
    { method: "POST" },
  );

  return result?.ok === true;
}
