import { SparkleIcon } from "@/common/components/AppIcons";
import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";

interface GuestRecommendationBannerProps {
  onLoginClick: () => void;
}

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
        className="w-full rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onLoginClick}
        type="button"
      >
        <span aria-hidden="true" className="flex gap-3 opacity-70">
          <span className="aspect-[3/4] w-[30%] rounded-control border border-border bg-muted" />
          <span className="aspect-[3/4] w-[30%] rounded-control border border-border bg-muted" />
          <span className="aspect-[3/4] w-[30%] rounded-control border border-border bg-muted" />
        </span>
        <span className="mt-3 flex items-center gap-2 type-body-small font-medium text-text-secondary">
          <SparkleIcon className="size-4 shrink-0" />
          <span>
            로그인하면 취향에 맞는 추천을 볼 수 있어요
          </span>
        </span>
      </button>
    </section>
  );
}
