import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import clarity from "@microsoft/clarity";
import "@/app/styles/global.css";
import App from "@/app/App";

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();
const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();

function isValidSentryDsn(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.username.length > 0 &&
      url.hostname.length > 0 &&
      url.pathname !== "/"
    );
  } catch {
    return false;
  }
}

if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

if (clarityProjectId) {
  clarity.init(clarityProjectId);
}

if (isValidSentryDsn(sentryDsn)) {
  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
    });
  });
}

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.DEV && window.location.pathname === "/dev/recommendation-preview") {
  void import("@/dev/DevRecommendationPreviewApp").then(({ default: DevRecommendationPreviewApp }) => {
    root.render(
      <StrictMode>
        <DevRecommendationPreviewApp />
      </StrictMode>,
    );
  });
} else if (import.meta.env.DEV && window.location.pathname === "/dev/preview") {
  void import("@/dev/DevPreviewApp").then(({ default: DevPreviewApp }) => {
    root.render(
      <StrictMode>
        <DevPreviewApp />
      </StrictMode>,
    );
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
