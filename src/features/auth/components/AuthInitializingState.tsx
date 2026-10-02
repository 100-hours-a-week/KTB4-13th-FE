export function AuthInitializingState() {
  return (
    <main
      aria-busy="true"
      className="flex h-dvh flex-col items-center justify-center gap-3 bg-surface px-5 text-center"
      role="status"
    >
      <p className="type-display font-serif font-semibold tracking-tighter text-text-primary">
        북적북적
      </p>
      <p className="break-keep type-body leading-relaxed text-text-secondary">
        로그인 상태를 확인하고 있어요
      </p>
    </main>
  );
}
