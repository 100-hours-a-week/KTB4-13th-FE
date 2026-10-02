import { HomeSectionHeader } from "@/pages/home/components/HomeSectionHeader";

const TEASER_COVER_TONES = [
  "bg-border-strong",
  "bg-accent-soft",
  "bg-primary/80",
  "bg-border",
];

interface GuestRecommendationBannerProps {
  onLoginClick: () => void;
}

export function GuestRecommendationBanner({
  onLoginClick,
}: GuestRecommendationBannerProps) {
  return (
    <section
      aria-labelledby="guest-recommendation-title"
      className="flex flex-col gap-3"
    >
      <div className="page-content">
        <HomeSectionHeader id="guest-recommendation-title" title="이런 책 어때요?" />
      </div>
      <button
        className="relative block w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        onClick={onLoginClick}
        type="button"
      >
        <span aria-hidden="true" className="flex gap-3 px-5 py-3 blur-sm">
          {TEASER_COVER_TONES.map((tone) => (
            <span
              className={`aspect-[3/4] w-[30%] shrink-0 rounded-control ${tone}`}
              key={tone}
            />
          ))}
        </span>
        <span className="absolute inset-0 flex items-center justify-center px-8">
          <span className="rounded-full border border-border bg-surface px-4 py-2 text-center type-body-small font-semibold text-text-primary">
            로그인하면 취향에 맞는 책을 골라드려요
          </span>
        </span>
      </button>
    </section>
  );
}
