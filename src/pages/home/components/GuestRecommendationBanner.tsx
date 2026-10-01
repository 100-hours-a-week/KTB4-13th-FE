import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";

interface GuestRecommendationBannerProps {
  onLoginClick: () => void;
}

// Guests keep browsing; personalized picks are offered as a short login prompt, not an empty list.
export function GuestRecommendationBanner({
  onLoginClick,
}: GuestRecommendationBannerProps) {
  return (
    <section
      aria-labelledby="guest-recommendation-title"
      className="page-content flex flex-col gap-3"
    >
      <HomeSectionHeader id="guest-recommendation-title" title="이런 책 어때요?" />
      <button
        className="flex w-full items-center justify-between gap-3 rounded-panel border border-border bg-muted px-4 py-3 text-left transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onLoginClick}
        type="button"
      >
        <span className="min-w-0">
          <span className="block type-body-small font-semibold text-text-primary">
            취향에 꼭 맞는 책을 골라드릴게요
          </span>
          <span className="mt-0.5 block type-caption text-text-secondary">
            로그인하면 개인화 추천을 확인할 수 있어요
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 type-heading text-text-tertiary">
          ›
        </span>
      </button>
    </section>
  );
}
