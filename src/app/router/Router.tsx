import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { LoginPage } from "@/pages/login/LoginPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
