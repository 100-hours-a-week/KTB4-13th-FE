export function LoginBrand() {
  return (
    <div className="flex max-w-xs flex-col items-center text-center">
      <img
        alt="북적북적 로고 심볼"
        className="size-16 object-contain"
        height="64"
        src={`${import.meta.env.BASE_URL}assets/bookjeok-logo-mark.png`}
        width="64"
      />
      <h1 className="mt-6 type-display font-serif font-semibold tracking-tighter text-text-primary">
        북적북적
      </h1>
      <p className="mt-3 break-keep type-body leading-relaxed text-text-secondary">
        대화 몇 마디로 지금 나에게 맞는 책을 찾아드려요
      </p>
    </div>
  );
}
