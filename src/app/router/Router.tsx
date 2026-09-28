import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/app/router/RequireAuth";
import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
