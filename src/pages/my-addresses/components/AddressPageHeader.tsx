import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";

interface AddressPageHeaderProps {
  // Used when the page was opened directly and has no in-app history to go back to.
  fallbackPath: string;
  title: string;
}

export function AddressPageHeader({ fallbackPath, title }: AddressPageHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.key === "default") {
      navigate(fallbackPath, { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center bg-surface">
      <button
        aria-label="이전 화면으로 돌아가기"
        className="-ml-2 inline-flex size-11 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={handleBack}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <h1 className="text-center type-title text-text-primary">{title}</h1>
      <span aria-hidden="true" />
    </header>
  );
}
