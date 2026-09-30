import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RedirectAuthenticatedUser } from "@/app/router/RedirectAuthenticatedUser";
import { RequireAuth } from "@/app/router/RequireAuth";
import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { CartPage } from "@/pages/cart/CartPage";
import { CatalogPage } from "@/pages/catalog/CatalogPage";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { OrderCompletePage } from "@/pages/order-complete/OrderCompletePage";
import { OrderPage } from "@/pages/order/OrderPage";
import { ProductDetailPage } from "@/pages/product/ProductDetailPage";
import { SearchResultsPage } from "@/pages/search/SearchResultsPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route element={<RedirectAuthenticatedUser />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route
          path="/catalog/ranking"
          element={<CatalogPage mode="ranking" />}
        />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/catalog/recommendations"
            element={<CatalogPage mode="recommendation" />}
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/complete" element={<OrderCompletePage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
