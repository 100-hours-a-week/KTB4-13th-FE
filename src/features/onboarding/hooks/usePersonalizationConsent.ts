import { useState } from "react";

// TODO(KTB4-13th-BE#129): Save and read this through the consent API.
// This React state is not a legal consent record and is intentionally not persisted
// to localStorage/sessionStorage or the server.
export function usePersonalizationConsent() {
  const [hasAgreedToPersonalization, setHasAgreedToPersonalization] =
    useState(false);

  return { hasAgreedToPersonalization, setHasAgreedToPersonalization };
}
