import { useEffect, useRef, useState } from "react";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  getPostcodeAddress,
  loadKakaoPostcode,
  openKakaoPostcode,
} from "@/features/order/lib/kakaoPostcode";
import type { UserAddress } from "@/features/order/types/order";
import type { AddressesState } from "@/pages/order/hooks/useAddresses";
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
  type?: "text" | "tel";
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
  type = "text",
  value,
}: FieldProps) {
  const inputId = `delivery-${field}`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label className="type-caption font-medium text-text-secondary" htmlFor={inputId}>
        {label}
        {required ? <span className="ml-1 text-error">필수</span> : null}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={`${inputClassName} mt-1.5 ${readOnly ? "bg-muted" : ""}`}
        id={inputId}
        inputMode={type === "tel" ? "tel" : undefined}
        onChange={(event) => onChange(field, event.target.value)}
        onBlur={() => onFieldBlur(field)}
        readOnly={readOnly}
        required={required}
        type={type}
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
          우편번호<span className="ml-1 text-error">필수</span>
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
            className="min-h-11 shrink-0 rounded-control border border-border bg-surface px-4 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
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
      <div aria-hidden="true" className="h-24 rounded-panel bg-muted" />
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
              aria-describedby="recent-address-unavailable"
              className="min-h-11 rounded-full border border-border bg-muted px-4 type-body-small text-text-disabled"
              disabled
              type="button"
            >
              최근배송지
            </button>
            <button
              aria-pressed={isDefaultMode}
              className={`min-h-11 rounded-full border px-4 type-body-small font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isDefaultMode
                  ? "border-accent bg-accent-soft text-text-primary"
                  : "border-border bg-surface text-text-secondary"
              }`}
              disabled={!defaultAddress}
              onClick={() => onModeChange("default")}
              type="button"
            >
              기본배송지
            </button>
            <button
              aria-pressed={mode === "new"}
              className={`min-h-11 rounded-full border px-4 type-body-small font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                mode === "new"
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-text-secondary"
              }`}
              onClick={() => onModeChange("new")}
              type="button"
            >
              새로입력
            </button>
          </div>
          <p className="sr-only" id="recent-address-unavailable">
            최근 배송지 정보가 없어 선택할 수 없습니다
          </p>

          {!defaultAddress ? (
            <p className="rounded-control bg-muted px-4 py-3 type-body-small text-text-secondary">
              등록된 기본 배송지가 없어 새 배송지를 입력해 주세요
            </p>
          ) : null}

          {isDefaultMode ? (
            <div className="rounded-panel border border-border bg-muted p-4">
              <div className="flex items-center gap-2">
                <p className="type-body-small font-semibold text-text-primary">
                  {defaultAddress.label}
                </p>
                <span className="rounded-full bg-surface px-2 py-0.5 type-caption text-text-secondary">
                  기본배송지
                </span>
              </div>
              <p className="mt-2 type-body-small text-text-secondary">
                ({defaultAddress.postalCode}) {defaultAddress.address}
                {defaultAddress.detailAddress
                  ? ` ${defaultAddress.detailAddress}`
                  : ""}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <AddressField
              error={errors.recipientName}
              field="recipientName"
              label="받는 분"
              onChange={onChange}
              onFieldBlur={onFieldBlur}
              required
              value={values.recipientName}
            />

            {!isDefaultMode ? (
              <NewAddressFields
                errors={errors}
                onChange={onChange}
                onFieldBlur={onFieldBlur}
                onPostcodeError={onPostcodeError}
                values={values}
              />
            ) : null}

            <AddressField
              error={errors.phoneNumber}
              field="phoneNumber"
              label="휴대폰"
              onChange={onChange}
              onFieldBlur={onFieldBlur}
              required
              type="tel"
              value={values.phoneNumber}
            />
            <AddressField
              field="additionalPhoneNumber"
              label="일반전화"
              onChange={onChange}
              onFieldBlur={onFieldBlur}
              type="tel"
              value={values.additionalPhoneNumber}
            />

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
