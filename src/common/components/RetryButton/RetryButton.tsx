interface RetryButtonProps {
  onClick: () => void;
}

export function RetryButton({ onClick }: RetryButtonProps) {
  return (
    <button
      className="relative shrink-0 font-semibold text-accent after:absolute after:-inset-x-1 after:-inset-y-3.5 after:content-[''] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onClick}
      type="button"
    >
      다시 시도
    </button>
  );
}
