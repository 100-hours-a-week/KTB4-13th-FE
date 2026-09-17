import type { ComponentProps } from "react";

import { Button } from "@/common/components/Button";

interface KakaoLoginButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "children" | "isLoading"
> {
  isLoading: boolean;
}

export function KakaoLoginButton({
  isLoading,
  className,
  ...props
}: KakaoLoginButtonProps) {
  return (
    <Button
      {...props}
      isLoading={isLoading}
      variant="custom"
      className={[
        "w-full bg-[#FEE500] text-[rgba(0,0,0,0.85)] hover:bg-[#FEE500]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      카카오로 시작하기
    </Button>
  );
}
