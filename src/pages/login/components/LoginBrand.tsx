export function LoginBrand() {
  return (
    <div className="flex max-w-xs flex-col items-center text-center">
      {/* TODO: Replace this placeholder with the approved 북적북적 logo asset. */}
      <div
        aria-label="북적북적 임시 로고"
        className="flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-white"
        role="img"
      >
        북
      </div>
      <h1 className="mt-5 type-heading">북적북적</h1>
      <p className="mt-3 type-body text-text-secondary">
        대화 몇 마디로 지금 나에게 맞는 책을 찾아드려요
      </p>
    </div>
  );
}
