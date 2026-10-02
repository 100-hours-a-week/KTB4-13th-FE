import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  getPostcodeAddress,
  loadKakaoPostcode,
  openKakaoPostcode,
} from "@/features/address/lib/kakaoPostcode";
import type { UserAddress } from "@/features/address/types/address";
import type { AddressesState } from "@/pages/order/hooks/useAddresses";
import {
  formatPhoneNumber,
  MAX_PHONE_NUMBER_LENGTH,
} from "@/pages/order/lib/orderForm";
import type {
  DeliveryFormErrors,
  DeliveryFormField,
  DeliveryFormValues,
  DeliveryMode,
} from "@/pages/order/lib/orderForm";

interface AddressSectionProps {
  defaultAddress: UserAddress | null;
  errors: DeliveryFormErrors;
  mode: DeliveryMode;
  onChange: (field: DeliveryFormField, value: string) => void;
  onFieldBlur: (field: DeliveryFormField) => void;
  onModeChange: (mode: DeliveryMode) => void;
  onPostcodeError: () => void;
  onRetry: () => void;
  state: AddressesState;
  values: DeliveryFormValues;
}

interface FieldProps {
  error?: string;
  field: DeliveryFormField;
  label: string;
  onChange: (field: DeliveryFormField, value: string) => void;
  onFieldBlur: (field: DeliveryFormField) => void;
  readOnly?: boolean;
  required?: boolean;
  value: string;
}

const inputClassName =
  "min-h-11 w-full rounded-control border border-border bg-surface px-3 type-body-small text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function AddressField({
  error,
  field,
  label,
  onChange,
  onFieldBlur,
  readOnly = false,
  required = false,
  value,
}: FieldProps) {
  const inputId = `delivery-${field}`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label className="type-caption font-medium text-text-secondary" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={`${inputClassName} mt-1.5 ${readOnly ? "bg-muted" : ""}`}
        id={inputId}
        onChange={(event) => onChange(field, event.target.value)}
        onBlur={() => onFieldBlur(field)}
        readOnly={readOnly}
        required={required}
        value={value}
      />
      {error ? (
        <p className="mt-1 type-caption text-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface PhoneNumberFieldProps {
  error?: string;
  onChange: (field: DeliveryFormField, value: string) => void;
  onFieldBlur: (field: DeliveryFormField) => void;
  value: string;
}

function PhoneNumberField({
  error,
  onChange,
  onFieldBlur,
  value,
}: PhoneNumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { selectionStart, value: rawValue } = event.target;
    const digitsBeforeCaret = rawValue
      .slice(0, selectionStart ?? rawValue.length)
      .replace(/\D/g, "").length;
    const formattedValue = formatPhoneNumber(rawValue);

    onChange("phoneNumber", formattedValue);
    window.requestAnimationFrame(() => {
      const input = inputRef.current;

      if (!input || document.activeElement !== input) {
        return;
      }

      let caret = 0;
      let digitCount = 0;
      while (caret < formattedValue.length && digitCount < digitsBeforeCaret) {
        if (/\d/.test(formattedValue[caret])) {
          digitCount += 1;
        }
        caret += 1;
      }
      input.setSelectionRange(caret, caret);
    });
  };

  return (
    <div>
      <label
        className="type-caption font-medium text-text-secondary"
        htmlFor="delivery-phoneNumber"
      >
        휴대폰
      </label>
      <input
        aria-describedby={error ? "delivery-phoneNumber-error" : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete="tel"
        className={`${inputClassName} mt-1.5`}
        id="delivery-phoneNumber"
        inputMode="numeric"
        maxLength={MAX_PHONE_NUMBER_LENGTH}
        onBlur={() => onFieldBlur("phoneNumber")}
        onChange={handleChange}
        placeholder="010-0000-0000"
        ref={inputRef}
        required
        type="tel"
        value={value}
      />
      {error ? (
        <p
          className="mt-1 type-caption text-error"
          id="delivery-phoneNumber-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface NewAddressFieldsProps {
  errors: DeliveryFormErrors;
  onChange: (field: DeliveryFormField, value: string) => void;
  onFieldBlur: (field: DeliveryFormField) => void;
  onPostcodeError: () => void;
  values: DeliveryFormValues;
}

function NewAddressFields({
  errors,
  onChange,
  onFieldBlur,
  onPostcodeError,
  values,
}: NewAddressFieldsProps) {
  const detailAddressRef = useRef<HTMLInputElement>(null);
  const [isOpeningPostcode, setIsOpeningPostcode] = useState(false);

  useEffect(() => {
    void loadKakaoPostcode().catch(() => undefined);
  }, []);

  const handlePostcodeSearch = async () => {
    if (isOpeningPostcode) {
      return;
    }

    setIsOpeningPostcode(true);

    try {
      await openKakaoPostcode((data) => {
        const address = getPostcodeAddress(data);

        if (!data.zonecode.trim() || !address.trim()) {
          onPostcodeError();
          return;
        }

        onChange("postalCode", data.zonecode);
        onChange("address", address);
        window.requestAnimationFrame(() => detailAddressRef.current?.focus());
      });
    } catch {
      onPostcodeError();
    } finally {
      setIsOpeningPostcode(false);
    }
  };

  return (
    <>
      <div>
        <label
          className="type-caption font-medium text-text-secondary"
          htmlFor="delivery-postalCode"
        >
          우편번호
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            aria-describedby={
              errors.postalCode ? "delivery-postalCode-error" : undefined
            }
            aria-invalid={errors.postalCode ? true : undefined}
            className={`${inputClassName} min-w-0 flex-1 bg-muted`}
            id="delivery-postalCode"
            readOnly
            required
            value={values.postalCode}
          />
          <button
            aria-busy={isOpeningPostcode || undefined}
            className="min-h-11 shrink-0 rounded-control border border-border-strong bg-surface px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isOpeningPostcode}
            onClick={() => void handlePostcodeSearch()}
            type="button"
          >
            {isOpeningPostcode ? "불러오는 중" : "우편번호 찾기"}
          </button>
        </div>
        {errors.postalCode ? (
          <p
            className="mt-1 type-caption text-error"
            id="delivery-postalCode-error"
          >
            {errors.postalCode}
          </p>
        ) : null}
      </div>
      <AddressField
        error={errors.address}
        field="address"
        label="주소"
        onChange={onChange}
        onFieldBlur={onFieldBlur}
        readOnly
        required
        value={values.address}
      />
      <div>
        <label
          className="type-caption font-medium text-text-secondary"
          htmlFor="delivery-detailAddress"
        >
          상세주소
        </label>
        <input
          className={`${inputClassName} mt-1.5`}
          id="delivery-detailAddress"
          onBlur={() => onFieldBlur("detailAddress")}
          onChange={(event) => onChange("detailAddress", event.target.value)}
          ref={detailAddressRef}
          value={values.detailAddress}
        />
      </div>
    </>
  );
}

function AddressLoadingState() {
  return (
    <div aria-busy="true" className="space-y-3" role="status">
      <span className="sr-only">배송지를 불러오는 중이에요</span>
      <div aria-hidden="true" className="h-11 rounded-control bg-muted" />
      <div aria-hidden="true" className="h-24 rounded-control bg-muted" />
    </div>
  );
}

export function AddressSection({
  defaultAddress,
  errors,
  mode,
  onChange,
  onFieldBlur,
  onModeChange,
  onPostcodeError,
  onRetry,
  state,
  values,
}: AddressSectionProps) {
  const isDefaultMode = mode === "default" && defaultAddress !== null;

  return (
    <section aria-labelledby="delivery-address-title" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="type-title text-text-primary" id="delivery-address-title">
          배송지
        </h2>
      </div>

      {state.kind === "loading" ? <AddressLoadingState /> : null}

      {state.kind === "error" ? (
        <Toast action={<RetryButton onClick={onRetry} />} variant="error">
          배송지를 불러오지 못했어요
        </Toast>
      ) : null}

      {state.kind === "ready" ? (
        <>
          <div aria-label="배송지 선택" className="flex flex-wrap gap-2">
            <button
              aria-pressed={isDefaultMode}
              className={`min-h-11 rounded-control border px-4 type-body-small focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-text-disabled ${
                isDefaultMode
                  ? "border-text-primary bg-surface font-semibold text-text-primary"
                  : "border-border bg-surface font-medium text-text-secondary"
              }`}
              disabled={!defaultAddress}
              onClick={() => onModeChange("default")}
              type="button"
            >
              기본배송지
            </button>
            <button
              aria-pressed={mode === "new"}
              className={`min-h-11 rounded-control border px-4 type-body-small focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                mode === "new"
                  ? "border-text-primary bg-surface font-semibold text-text-primary"
                  : "border-border bg-surface font-medium text-text-secondary"
              }`}
              onClick={() => onModeChange("new")}
              type="button"
            >
              직접 입력
            </button>
          </div>

          {!defaultAddress ? (
            <p className="rounded-control bg-muted px-4 py-3 type-body-small text-text-secondary">
              등록된 기본 배송지가 없어 새 배송지를 입력해 주세요
            </p>
          ) : null}

          <div className="space-y-3">
            {isDefaultMode ? (
              <div className="rounded-control bg-muted px-4 py-3">
                <p className="break-words type-body-small font-semibold text-text-primary">
                  {defaultAddress.label}
                </p>
                <p className="mt-1 break-words type-body-small text-text-secondary">
                  ({defaultAddress.postalCode}) {defaultAddress.address}
                </p>
                {defaultAddress.detailAddress ? (
                  <p className="break-words type-body-small text-text-secondary">
                    {defaultAddress.detailAddress}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <AddressField
                  error={errors.recipientName}
                  field="recipientName"
                  label="받는 분"
                  onChange={onChange}
                  onFieldBlur={onFieldBlur}
                  required
                  value={values.recipientName}
                />
                <PhoneNumberField
                  error={errors.phoneNumber}
                  onChange={onChange}
                  onFieldBlur={onFieldBlur}
                  value={values.phoneNumber}
                />
                <NewAddressFields
                  errors={errors}
                  onChange={onChange}
                  onFieldBlur={onFieldBlur}
                  onPostcodeError={onPostcodeError}
                  values={values}
                />
              </>
            )}

            <div>
              <label
                className="type-caption font-medium text-text-secondary"
                htmlFor="delivery-request"
              >
                배송 요청사항
              </label>
              <select
                className={`${inputClassName} mt-1.5`}
                id="delivery-request"
                onChange={(event) =>
                  onChange("deliveryRequest", event.target.value)
                }
                value={values.deliveryRequest}
              >
                <option value="">배송 요청사항 선택</option>
                <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                <option value="부재 시 경비실에 맡겨주세요">
                  부재 시 경비실에 맡겨주세요
                </option>
                <option value="직접 받을게요">직접 받을게요</option>
              </select>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
