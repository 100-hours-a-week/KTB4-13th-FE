import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchPublic } from "@/common/api/httpClient";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  CouponType,
  Coupon,
  OwnedCoupon,
  OwnedCouponStatus,
  PointHistory,
  PointSummary,
  PointType,
} from "@/features/benefit/types/benefit";

export type BenefitResult<T> =
  | { data: T; ok: true }
  | { ok: false; reason: "unauthorized" | "error" };

const COUPON_TYPES: CouponType[] = ["NONE", "FIXED_AMOUNT", "PERCENT_RATE"];
const COUPON_STATUSES: OwnedCouponStatus[] = ["ISSUED", "USED"];
const POINT_TYPES: PointType[] = ["PAYMENT", "REVIEW"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseOwnedCoupon(value: unknown): OwnedCoupon | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    !COUPON_STATUSES.includes(value.state as OwnedCouponStatus) ||
    typeof value.name !== "string" ||
    !COUPON_TYPES.includes(value.type as CouponType) ||
    !isFiniteNumber(value.discount) ||
    !isFiniteNumber(value.minOrderAmount) ||
    !Number.isSafeInteger(value.maxUseCount) ||
    !Number.isSafeInteger(value.usedCount) ||
    typeof value.expiredAt !== "string"
  ) {
    return null;
  }

  return value as unknown as OwnedCoupon;
}

function parseCoupon(value: unknown): Coupon | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    typeof value.name !== "string" ||
    !COUPON_TYPES.includes(value.type as CouponType) ||
    !isFiniteNumber(value.discount) ||
    !isFiniteNumber(value.minOrderAmount) ||
    typeof value.expiredAt !== "string"
  ) {
    return null;
  }
  return value as unknown as Coupon;
}

function parsePointHistory(value: unknown): PointHistory | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    !Number.isSafeInteger(value.userId) ||
    !POINT_TYPES.includes(value.type as PointType) ||
    !Number.isSafeInteger(value.referenceId) ||
    !isFiniteNumber(value.amount) ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  return value as unknown as PointHistory;
}

function failure(status: number): BenefitResult<never> {
  return { ok: false, reason: status === 401 ? "unauthorized" : "error" };
}

export async function fetchOwnedCoupons(
  signal?: AbortSignal,
): Promise<BenefitResult<OwnedCoupon[]>> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/owned-coupons", { signal }),
    );
    if (!result.ok) return failure(result.status);
    if (!Array.isArray(result.data)) return { ok: false, reason: "error" };

    const coupons = result.data.map(parseOwnedCoupon);
    return coupons.every((coupon): coupon is OwnedCoupon => coupon !== null)
      ? { data: coupons, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function fetchCoupons(
  couponIds: number[],
  signal?: AbortSignal,
): Promise<BenefitResult<Coupon[]>> {
  if (couponIds.length === 0) return { data: [], ok: true };
  const params = new URLSearchParams();
  couponIds.forEach((id) => params.append("ids", String(id)));
  try {
    const result = await parseApiResponse(
      await fetchPublic(`/api/v1/coupons?${params.toString()}`, { signal }),
    );
    if (!result.ok || !Array.isArray(result.data)) {
      return { ok: false, reason: "error" };
    }
    const coupons = result.data.map(parseCoupon);
    return coupons.every((coupon): coupon is Coupon => coupon !== null)
      ? { data: coupons, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function issueCoupon(couponId: number) {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/coupons/${couponId}/issue`, { method: "POST" }),
    );
    return result.ok
      ? { ok: true as const }
      : { message: result.error?.message?.trim() || null, ok: false as const };
  } catch {
    return { message: null, ok: false as const };
  }
}

export async function fetchPointSummary(
  signal?: AbortSignal,
): Promise<BenefitResult<PointSummary>> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth("/api/v1/point", { signal }),
    );
    if (!result.ok) return failure(result.status);
    if (
      !isRecord(result.data) ||
      !isRecord(result.data.balance) ||
      !isFiniteNumber(result.data.balance.balance) ||
      !Array.isArray(result.data.histories)
    ) {
      return { ok: false, reason: "error" };
    }

    const histories = result.data.histories.map(parsePointHistory);
    return histories.every((history): history is PointHistory => history !== null)
      ? {
          data: { balance: result.data.balance.balance, histories },
          ok: true,
        }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
