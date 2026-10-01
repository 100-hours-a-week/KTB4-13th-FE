export function AuthInitializingState() {
  return (
    <main
      aria-busy="true"
      className="flex h-dvh flex-col items-center justify-center gap-2 bg-surface px-5 text-center"
      role="status"
    >
      <p className="type-title font-bold text-text-primary">북적북적</p>
      <p className="type-body-small text-text-secondary">
        로그인 상태를 확인하고 있어요
      </p>
    </main>
  );
}
