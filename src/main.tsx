import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import clarity from "@microsoft/clarity";
import * as Sentry from "@sentry/react";
import "@/app/styles/global.css";
import App from "@/app/App";

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();
const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();

if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

if (clarityProjectId) {
  clarity.init(clarityProjectId);
}

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
