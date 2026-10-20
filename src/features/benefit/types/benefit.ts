export type CouponType = "NONE" | "FIXED_AMOUNT" | "PERCENT_RATE";
export type OwnedCouponStatus = "ISSUED" | "USED";

export interface Coupon {
  discount: number;
  expiredAt: string;
  id: number;
  minOrderAmount: number;
  name: string;
  type: CouponType;
}

export interface OwnedCoupon {
  discount: number;
  expiredAt: string;
  id: number;
  maxUseCount: number;
  minOrderAmount: number;
  name: string;
  state: OwnedCouponStatus;
  type: CouponType;
  usedCount: number;
}

export type PointType = "PAYMENT" | "REVIEW";

export interface PointHistory {
  amount: number;
  createdAt: string;
  id: number;
  referenceId: number;
  type: PointType;
  userId: number;
}

export interface PointSummary {
  balance: number;
  histories: PointHistory[];
}
