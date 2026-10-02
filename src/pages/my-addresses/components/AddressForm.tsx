import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/common/components/Button";
import {
  getPostcodeAddress,
  loadKakaoPostcode,
  openKakaoPostcode,
} from "@/features/address/lib/kakaoPostcode";

export interface AddressFormValues {
  address: string;
  detailAddress: string;
  isDefault: boolean;
  label: string;
  postalCode: string;
}

type AddressFormField = "label" | "postalCode" | "address";
type AddressFormErrors = Partial<Record<AddressFormField, string>>;

// "first-address" explains that the backend always makes the first address the default.
export type DefaultAddressOption = "selectable" | "first-address" | "hidden";

// UI-only limit for short names such as 집 or 회사; the backend column allows 255 characters.
const MAX_LABEL_LENGTH = 20;
const MAX_DETAIL_ADDRESS_LENGTH = 255;

const inputClassName =
  "mt-1.5 min-h-11 w-full rounded-control border border-border bg-surface px-3 type-body-small text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const labelClassName = "type-caption font-medium text-text-secondary";

function validateAddressForm(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!values.label.trim()) {
    errors.label = "배송지 이름을 입력해 주세요";
  }
  if (!values.postalCode.trim()) {
    errors.postalCode = "우편번호 찾기로 주소를 선택해 주세요";
  }
  if (!values.address.trim()) {
    errors.address = "주소를 선택해 주세요";
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="mt-1 type-caption text-error" id={id}>
      {message}
    </p>
  ) : null;
}

interface AddressFormProps {
  defaultAddressOption: DefaultAddressOption;
  initialValues: AddressFormValues;
  isSubmitting: boolean;
  onSubmit: (values: AddressFormValues) => void;
  submitLabel: string;
}

export function AddressForm({
  defaultAddressOption,
  initialValues,
  isSubmitting,
  onSubmit,
  submitLabel,
}: AddressFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [isOpeningPostcode, setIsOpeningPostcode] = useState(false);
  const [postcodeErrorMessage, setPostcodeErrorMessage] = useState<
    string | null
  >(null);
  const detailAddressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadKakaoPostcode().catch(() => undefined);
  }, []);

  const updateValue = <TField extends keyof AddressFormValues>(
    field: TField,
    nextValue: AddressFormValues[TField],
  ) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      const next = { ...current };
      delete next[field as AddressFormField];
      return next;
    });
  };

  const handlePostcodeSearch = async () => {
    if (isOpeningPostcode) {
      return;
    }

    setIsOpeningPostcode(true);
    setPostcodeErrorMessage(null);

    try {
      await openKakaoPostcode((postcode) => {
        const selectedAddress = getPostcodeAddress(postcode);

        if (!postcode.zonecode.trim() || !selectedAddress.trim()) {
          setPostcodeErrorMessage("선택한 주소를 불러오지 못했어요. 다시 검색해 주세요");
          return;
        }

        updateValue("postalCode", postcode.zonecode);
        updateValue("address", selectedAddress);
        window.requestAnimationFrame(() => detailAddressRef.current?.focus());
      });
    } catch {
      setPostcodeErrorMessage("주소 검색을 불러오지 못했어요. 다시 시도해 주세요");
    } finally {
      setIsOpeningPostcode(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateAddressForm(values);
    setErrors(nextErrors);

    if (isSubmitting || Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
      <div className="page-content min-h-0 flex-1 space-y-5 overflow-y-auto py-6">
        <div>
          <label className={labelClassName} htmlFor="address-label">
            배송지 이름<span className="ml-1 text-error">필수</span>
          </label>
          <input
            aria-describedby={errors.label ? "address-label-error" : undefined}
            aria-invalid={errors.label ? true : undefined}
            autoComplete="off"
            className={inputClassName}
            id="address-label"
            maxLength={MAX_LABEL_LENGTH}
            onChange={(event) => updateValue("label", event.target.value)}
            placeholder="예: 집, 회사"
            required
            value={values.label}
          />
          <FieldError id="address-label-error" message={errors.label} />
        </div>

        <div>
          <label className={labelClassName} htmlFor="address-postal-code">
            우편번호<span className="ml-1 text-error">필수</span>
          </label>
          <div className="flex gap-2">
            <input
              aria-describedby={
                errors.postalCode ? "address-postal-code-error" : undefined
              }
              aria-invalid={errors.postalCode ? true : undefined}
              className={`${inputClassName} min-w-0 flex-1 bg-muted`}
              id="address-postal-code"
              readOnly
              required
              value={values.postalCode}
            />
            <button
              aria-busy={isOpeningPostcode || undefined}
              className="mt-1.5 min-h-11 shrink-0 rounded-control border border-border-strong bg-surface px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isOpeningPostcode}
              onClick={() => void handlePostcodeSearch()}
              type="button"
            >
              {isOpeningPostcode ? "불러오는 중" : "우편번호 찾기"}
            </button>
          </div>
          <FieldError id="address-postal-code-error" message={errors.postalCode} />
          {postcodeErrorMessage ? (
            <p className="mt-1 type-caption text-error" role="alert">
              {postcodeErrorMessage}
            </p>
          ) : null}
        </div>

        <div>
          <label className={labelClassName} htmlFor="address-road">
            주소<span className="ml-1 text-error">필수</span>
          </label>
          <input
            aria-describedby={errors.address ? "address-road-error" : undefined}
            aria-invalid={errors.address ? true : undefined}
            className={`${inputClassName} bg-muted`}
            id="address-road"
            readOnly
            required
            value={values.address}
          />
          <FieldError id="address-road-error" message={errors.address} />
        </div>

        <div>
          <label className={labelClassName} htmlFor="address-detail">
            상세주소
          </label>
          <input
            autoComplete="off"
            className={inputClassName}
            id="address-detail"
            maxLength={MAX_DETAIL_ADDRESS_LENGTH}
            onChange={(event) => updateValue("detailAddress", event.target.value)}
            ref={detailAddressRef}
            value={values.detailAddress}
          />
        </div>

        {defaultAddressOption === "selectable" ? (
          <label className="flex min-h-11 items-center gap-3 type-body-small text-text-primary">
            <input
              checked={values.isDefault}
              className="size-5 accent-primary"
              onChange={(event) => updateValue("isDefault", event.target.checked)}
              type="checkbox"
            />
            기본 배송지로 설정
          </label>
        ) : null}
        {defaultAddressOption === "first-address" ? (
          <p className="type-caption text-text-secondary">
            첫 배송지는 기본 배송지로 저장돼요
          </p>
        ) : null}
      </div>

      <div className="safe-area-bottom shrink-0 border-t border-hairline bg-surface px-5 pt-3">
        <Button className="min-h-12 w-full" isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
