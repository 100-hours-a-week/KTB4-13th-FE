import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "@/pages/login/LoginPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
