import { Toast } from "@/common/components/Toast";
import { RetryButton } from "@/common/components/RetryButton";

interface OnboardingEntryErrorProps {
  onRetry: () => void;
}

export function OnboardingEntryError({ onRetry }: OnboardingEntryErrorProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
      <div className="w-full max-w-sm">
        <Toast action={<RetryButton onClick={onRetry} />} variant="error">
          회원 정보를 불러오지 못했어요
        </Toast>
      </div>
    </main>
  );
}
