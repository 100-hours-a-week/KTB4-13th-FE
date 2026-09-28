import { Link } from "react-router-dom";

interface LoginRequiredProps {
  description: string;
}

export function LoginRequired({ description }: LoginRequiredProps) {
  return (
    <section className="flex flex-col items-center gap-2 py-16 text-center">
      <h2 className="type-title text-text-primary">로그인이 필요합니다</h2>
      <p className="type-body-small text-text-secondary">{description}</p>
      <Link
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to="/login"
      >
        로그인하기
      </Link>
    </section>
  );
}
