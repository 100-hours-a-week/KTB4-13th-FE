import { useEffect, useRef, useState } from "react";

import {
  fetchPersonalizationConsent,
  savePersonalizationConsent,
} from "@/features/onboarding/api/onboardingApi";

type ConsentLoadStatus = "loading" | "error" | "ready";

export function usePersonalizationConsent() {
  const [consentStatus, setConsentStatus] =
    useState<ConsentLoadStatus>("loading");
  const [consentRequestKey, setConsentRequestKey] = useState(0);
  const [hasAgreedToPersonalization, setHasAgreedToPersonalization] =
    useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [hasConsentSaveError, setHasConsentSaveError] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    void fetchPersonalizationConsent().then((consent) => {
      if (!isActive) {
        return;
      }

      if (!consent) {
        setConsentStatus("error");
        return;
      }

      setHasAgreedToPersonalization(consent.consented);
      setConsentStatus("ready");
    });

    return () => {
      isActive = false;
    };
  }, [consentRequestKey]);

  const retryConsent = () => {
    setConsentStatus("loading");
    setConsentRequestKey((current) => current + 1);
  };

  const updateConsentSelection = (value: boolean) => {
    setHasAgreedToPersonalization(value);
    setHasConsentSaveError(false);
  };

  const saveConsent = async (consented: boolean) => {
    if (isSavingRef.current) {
      return false;
    }

    isSavingRef.current = true;
    setIsSavingConsent(true);
    setHasConsentSaveError(false);

    const savedConsent = await savePersonalizationConsent(consented);

    isSavingRef.current = false;
    setIsSavingConsent(false);

    if (!savedConsent) {
      setHasConsentSaveError(true);
      return false;
    }

    setHasAgreedToPersonalization(savedConsent.consented);
    return true;
  };

  return {
    consentStatus,
    hasAgreedToPersonalization,
    hasConsentSaveError,
    isSavingConsent,
    retryConsent,
    saveConsent,
    setHasAgreedToPersonalization: updateConsentSelection,
  };
}
