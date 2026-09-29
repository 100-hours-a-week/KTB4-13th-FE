import type { UserAddress } from "@/features/order/types/order";

export type DeliveryMode = "default" | "new";

export interface DeliveryFormValues {
  additionalPhoneNumber: string;
  address: string;
  deliveryRequest: string;
  detailAddress: string;
  phoneNumber: string;
  postalCode: string;
  recipientName: string;
}

export type DeliveryFormField = keyof DeliveryFormValues;
export type DeliveryFormErrors = Partial<
  Record<DeliveryFormField, string>
>;

export const EMPTY_DELIVERY_FORM: DeliveryFormValues = {
  additionalPhoneNumber: "",
  address: "",
  deliveryRequest: "",
  detailAddress: "",
  phoneNumber: "",
  postalCode: "",
  recipientName: "",
};

export function getEffectiveDeliveryValues(
  mode: DeliveryMode,
  values: DeliveryFormValues,
  defaultAddress: UserAddress | null,
): DeliveryFormValues {
  if (mode !== "default" || !defaultAddress) {
    return values;
  }

  return {
    ...values,
    address: defaultAddress.address,
    detailAddress: defaultAddress.detailAddress ?? "",
    postalCode: defaultAddress.postalCode,
  };
}

export function validateDeliveryForm(
  values: DeliveryFormValues,
): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {};

  if (!values.recipientName.trim()) {
    errors.recipientName = "받는 분을 입력해 주세요";
  }
  if (!values.postalCode.trim()) {
    errors.postalCode = "우편번호를 입력해 주세요";
  }
  if (!values.address.trim()) {
    errors.address = "주소를 입력해 주세요";
  }
  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "휴대폰 번호를 입력해 주세요";
  }

  return errors;
}
