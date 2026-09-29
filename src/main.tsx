import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import clarity from "@microsoft/clarity";
import * as Sentry from "@sentry/react";
import "@/app/styles/global.css";
import App from "@/app/App";

ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
clarity.init(import.meta.env.VITE_CLARITY_PROJECT_ID);

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);