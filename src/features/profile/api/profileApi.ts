import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";

export type ProfileResult =
  | { nickname: string; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

export type ProfileMutationResult =
  | { ok: true }
  | { ok: false; reason: "invalid-nickname" | "unauthorized" | "error" };

function isProfile(value: unknown): value is { nickname: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "nickname") === "string"
  );
}

export async function fetchMyProfile(signal?: AbortSignal): Promise<ProfileResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/users/me", { signal }),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: result.status === 401 ? "unauthorized" : "error",
      };
    }

    return isProfile(result.data)
      ? { nickname: result.data.nickname, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function updateMyProfile(
  nickname: string,
): Promise<ProfileMutationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/users/me", {
        body: JSON.stringify({ nickname }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
    );

    if (result.ok) {
      return { ok: true };
    }
    if (result.status === 401) {
      return { ok: false, reason: "unauthorized" };
    }
    return {
      ok: false,
      reason:
        result.status === 400 || result.error?.code === "INVALID_NICKNAME"
          ? "invalid-nickname"
          : "error",
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function requestMyProfileDeletion(): Promise<ProfileMutationResult> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/users/me", { method: "DELETE" }),
    );

    if (result.ok) {
      return { ok: true };
    }
    return {
      ok: false,
      reason: result.status === 401 ? "unauthorized" : "error",
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}
