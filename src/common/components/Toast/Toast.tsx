import type { ReactNode } from "react";

type ToastVariant = "default" | "error";

interface ToastProps {
  action?: ReactNode;
  children: ReactNode;
  variant?: ToastVariant;
}

const variantClassNames: Record<ToastVariant, string> = {
  default: "border-border bg-surface text-text-primary",
  error: "border-error bg-surface text-text-primary",
};

export function Toast({ children, action, variant = "default" }: ToastProps) {
  const isError = variant === "error";

  return (
    <div
      aria-live={isError ? "assertive" : "polite"}
      className={`flex items-center gap-3 rounded-panel border px-4 py-3 type-body ${variantClassNames[variant]}`}
      role={isError ? "alert" : "status"}
    >
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}
