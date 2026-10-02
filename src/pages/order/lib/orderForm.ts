export type DeliveryMode = "default" | "new";

export interface DeliveryFormValues {
  address: string;
  detailAddress: string;
  label: string;
  postalCode: string;
}

export type DeliveryFormField = keyof DeliveryFormValues;
export type DeliveryFormErrors = Partial<
  Record<DeliveryFormField, string>
>;

export const EMPTY_DELIVERY_FORM: DeliveryFormValues = {
  address: "",
  detailAddress: "",
  label: "",
  postalCode: "",
};

export function validateDeliveryForm(
  mode: DeliveryMode,
  values: DeliveryFormValues,
): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {};

  if (mode === "default") {
    return errors;
  }

  if (!values.label.trim()) {
    errors.label = "배송지 이름을 입력해 주세요";
  }
  if (!values.postalCode.trim()) {
    errors.postalCode = "우편번호를 입력해 주세요";
  }
  if (!values.address.trim()) {
    errors.address = "주소를 입력해 주세요";
  }

  return errors;
}
