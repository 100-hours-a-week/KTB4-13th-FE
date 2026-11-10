import type { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-background lg:flex lg:items-center lg:justify-center">
      {/* Positioning root for in-app overlays such as the chat session panel. */}
      <div className="relative min-h-dvh w-full overflow-x-hidden bg-surface lg:h-dvh lg:min-h-0 lg:w-auto lg:aspect-mobile-shell lg:overflow-y-auto" id="app-shell">
        {children}
      </div>
    </div>
  );
}
