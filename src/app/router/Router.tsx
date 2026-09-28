import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RedirectAuthenticatedUser } from "@/app/router/RedirectAuthenticatedUser";
import { RequireAuth } from "@/app/router/RequireAuth";
import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { CatalogPage } from "@/pages/catalog/CatalogPage";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route element={<RedirectAuthenticatedUser />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
        <Route element={<RequireAuth />}>
          <Route
            path="/catalog/ranking"
            element={<CatalogPage mode="ranking" />}
          />
          <Route
            path="/catalog/recommendations"
            element={<CatalogPage mode="recommendation" />}
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
