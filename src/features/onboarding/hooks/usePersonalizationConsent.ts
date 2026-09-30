import { useRef, useState } from "react";

import { recordPersonalizationAgreement } from "@/features/onboarding/api/onboardingApi";

export function usePersonalizationConsent() {
  const [hasAgreedToPersonalization, setHasAgreedToPersonalization] =
    useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [hasConsentSaveError, setHasConsentSaveError] = useState(false);
  const isSavingRef = useRef(false);

  const updateConsentSelection = (value: boolean) => {
    setHasAgreedToPersonalization(value);
    setHasConsentSaveError(false);
  };

  const submitConsentSelection = async () => {
    if (!hasAgreedToPersonalization) {
      setHasConsentSaveError(false);
      return true;
    }

    if (isSavingRef.current) {
      return false;
    }

    isSavingRef.current = true;
    setIsSavingConsent(true);
    setHasConsentSaveError(false);

    try {
      const isRecorded = await recordPersonalizationAgreement();

      if (!isRecorded) {
        setHasConsentSaveError(true);
      }

      return isRecorded;
    } finally {
      isSavingRef.current = false;
      setIsSavingConsent(false);
    }
  };

  return {
    hasAgreedToPersonalization,
    hasConsentSaveError,
    isSavingConsent,
    setHasAgreedToPersonalization: updateConsentSelection,
    submitConsentSelection,
  };
}
