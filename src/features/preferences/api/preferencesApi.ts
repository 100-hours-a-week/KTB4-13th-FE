import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  OnboardingPreference,
  UserMemoryGroup,
  UserPreferences,
} from "@/features/preferences/types/preferences";

export type PreferencesResult =
  | { data: UserPreferences; ok: true }
  | { ok: false; reason: "unauthorized" | "not-ready" | "error" };

export type DeleteMemoriesResult =
  | { ok: true }
  | { ok: false; reason: "unauthorized" | "not-found" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseOnboardingPreference(value: unknown): OnboardingPreference | null {
  if (
    !isRecord(value) ||
    typeof value.questionId !== "number" ||
    !Array.isArray(value.options) ||
    !value.options.every(
      (option) =>
        isRecord(option) &&
        typeof option.optionId === "number" &&
        typeof option.name === "string",
    )
  ) {
    return null;
  }

  return { options: value.options, questionId: value.questionId };
}

function parseMemoryGroup(value: unknown): UserMemoryGroup | null {
  if (
    !isRecord(value) ||
    !isNumberArray(value.memoryIds) ||
    typeof value.type !== "string" ||
    typeof value.value !== "string" ||
    !isStringArray(value.categories) ||
    !isStringArray(value.conversationDates)
  ) {
    return null;
  }

  return {
    categories: value.categories,
    conversationDates: value.conversationDates,
    memoryIds: value.memoryIds,
    type: value.type,
    value: value.value,
  };
}

function parsePreferences(value: unknown): UserPreferences | null {
  if (!isRecord(value) || !Array.isArray(value.onboarding) || !Array.isArray(value.memories)) {
    return null;
  }

  const onboarding = value.onboarding.map(parseOnboardingPreference);
  const memories = value.memories.map(parseMemoryGroup);
  if (onboarding.some((item) => item === null) || memories.some((item) => item === null)) {
    return null;
  }

  return {
    memories: memories.filter((item): item is UserMemoryGroup => item !== null),
    onboarding: onboarding.filter((item): item is OnboardingPreference => item !== null),
  };
}

export async function fetchMyPreferences(signal?: AbortSignal): Promise<PreferencesResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/users/me/preferences", { signal }),
    );

    if (!result.ok) {
      if (result.status === 401) return { ok: false, reason: "unauthorized" };
      if (result.status === 404 || result.status === 409) return { ok: false, reason: "not-ready" };
      return { ok: false, reason: "error" };
    }

    const data = parsePreferences(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

async function deleteMemories(path: string): Promise<DeleteMemoriesResult> {
  try {
    const result = await parseApiResponse(await fetchWithAuth(path, { method: "DELETE" }));
    if (result.ok) return { ok: true };
    if (result.status === 401) return { ok: false, reason: "unauthorized" };
    if (result.status === 404) return { ok: false, reason: "not-found" };
    return { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function deleteMyMemories(memoryIds: number[]) {
  return deleteMemories(`/api/v1/users/me/memories?ids=${memoryIds.map(String).join(",")}`);
}

export function deleteAllMyMemories() {
  return deleteMemories("/api/v1/users/me/memories/all");
}
