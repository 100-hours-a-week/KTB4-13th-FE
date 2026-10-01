export type DeliveryMode = "default" | "new";

export interface DeliveryFormValues {
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
  address: "",
  deliveryRequest: "",
  detailAddress: "",
  phoneNumber: "",
  postalCode: "",
  recipientName: "",
};

export const MAX_PHONE_NUMBER_LENGTH = 13;

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function validateDeliveryForm(
  mode: DeliveryMode,
  values: DeliveryFormValues,
): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {};

  if (mode === "default") {
    return errors;
  }

  if (!values.recipientName.trim()) {
    errors.recipientName = "받는 분을 입력해 주세요";
  }
  if (!values.postalCode.trim()) {
    errors.postalCode = "우편번호를 입력해 주세요";
  }
  if (!values.address.trim()) {
    errors.address = "주소를 입력해 주세요";
  }
  const phoneDigits = values.phoneNumber.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phoneNumber = "휴대폰 번호를 입력해 주세요";
  } else if (!/^01\d{8,9}$/.test(phoneDigits)) {
    errors.phoneNumber = "휴대폰 번호를 확인해 주세요";
  }

  return errors;
}
