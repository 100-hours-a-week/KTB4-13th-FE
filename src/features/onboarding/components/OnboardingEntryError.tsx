import { RetryButton } from "@/common/components/RetryButton";

interface OnboardingEntryErrorProps {
  onRetry: () => void;
}

export function OnboardingEntryError({ onRetry }: OnboardingEntryErrorProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-xs">
        <div
          aria-live="assertive"
          className="flex flex-col items-center gap-2 border-t border-error pt-4 text-center"
          role="alert"
        >
          <p className="break-keep type-body leading-relaxed text-text-primary">
            회원 정보를 불러오지 못했어요
          </p>
          <RetryButton onClick={onRetry} />
        </div>
      </div>
    </main>
  );
}
