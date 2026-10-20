import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { OnboardingEntryGuard } from "@/app/router/OnboardingEntryGuard";
import { RequireAuth } from "@/app/router/RequireAuth";
import { KakaoCallbackPage } from "@/pages/auth/KakaoCallbackPage";
import { CartPage } from "@/pages/cart/CartPage";
import { CatalogPage } from "@/pages/catalog/CatalogPage";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { LibraryPage } from "@/pages/library/LibraryPage";
import { MyAddressCreatePage } from "@/pages/my-addresses/MyAddressCreatePage";
import { MyAddressEditPage } from "@/pages/my-addresses/MyAddressEditPage";
import { MyAddressesPage } from "@/pages/my-addresses/MyAddressesPage";
import { MyPage } from "@/pages/my/MyPage";
import { MyBenefitsPage } from "@/pages/my-benefits/MyBenefitsPage";
import { NotificationPage } from "@/pages/notifications/NotificationPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { OrderHistoryPage } from "@/pages/order-history/OrderHistoryPage";
import { OrderDetailPage } from "@/pages/order-detail/OrderDetailPage";
import { OrderPage } from "@/pages/order/OrderPage";
import { PaymentPage } from "@/pages/payment/PaymentPage";
import { PaymentResultPage } from "@/pages/payment-result/PaymentResultPage";
import { ProductDetailPage } from "@/pages/product/ProductDetailPage";
import { ProfileEditPage } from "@/pages/profile/ProfileEditPage";
import { PreferenceEditPage } from "@/pages/preferences/PreferenceEditPage";
import { AiRecommendationChatPage } from "@/pages/recommendation-chat/AiRecommendationChatPage";
import { SearchResultsPage } from "@/pages/search/SearchResultsPage";
import { ReviewListPage } from "@/pages/reviews/ReviewListPage";
import { ReviewWritePage } from "@/pages/reviews/ReviewWritePage";
import { WithdrawPage } from "@/pages/withdraw/WithdrawPage";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route element={<OnboardingEntryGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/products/:productId/reviews" element={<ReviewListPage />} />
          <Route
            path="/catalog/ranking"
            element={<CatalogPage mode="ranking" />}
          />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/my" element={<MyPage />} />
            <Route path="/my/benefits" element={<MyBenefitsPage />} />
            <Route path="/my/profile" element={<ProfileEditPage />} />
            <Route path="/my/preferences" element={<PreferenceEditPage />} />
            <Route
              path="/my/preferences/onboarding"
              element={<OnboardingPage mode="edit" />}
            />
            <Route path="/my/library" element={<LibraryPage />} />
            <Route path="/my/withdraw" element={<WithdrawPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/my/addresses" element={<MyAddressesPage />} />
            <Route
              path="/my/addresses/new"
              element={<MyAddressCreatePage />}
            />
            <Route
              path="/my/addresses/:addressId/edit"
              element={<MyAddressEditPage />}
            />
            <Route
              path="/catalog/recommendations"
              element={<CatalogPage mode="recommendation" />}
            />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentResultPage kind="success" />} />
            <Route path="/payment/fail" element={<PaymentResultPage kind="fail" />} />
            <Route path="/my/orders" element={<OrderHistoryPage />} />
            <Route path="/my/orders/:orderKey" element={<OrderDetailPage />} />
            <Route
              path="/recommendations/chat"
              element={<AiRecommendationChatPage />}
            />
            <Route path="/products/:productId/reviews/new" element={<ReviewWritePage />} />
          </Route>
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
