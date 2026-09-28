// Service entry route for completed or non-personalized users; the Home screen itself is out of scope.
export function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-surface px-5 py-10 text-center">
      <h1 className="type-heading text-text-primary">북적북적</h1>
      <p className="type-body text-text-secondary">홈 화면을 준비하고 있어요</p>
    </main>
  );
}
