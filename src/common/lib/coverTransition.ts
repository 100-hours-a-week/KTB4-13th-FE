import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";

export const COVER_TRANSITION_NAME = "book-cover";

export interface CoverPreview {
  thumbnailUrl: string | null;
  title: string;
}

export interface CoverNavigationState {
  coverPreview?: CoverPreview;
}

export function readCoverPreview(state: unknown): CoverPreview | null {
  const preview = (state as CoverNavigationState | null)?.coverPreview;

  return preview && typeof preview.title === "string" ? preview : null;
}

function canMorph() {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    // A cover already named on screen (one detail page to another) would clash, so plain navigation.
    document.querySelector("[data-cover-target]") === null
  );
}

/*
 * Click handler for a link that holds a BookCover: the tapped cover grows into the detail page cover.
 * BrowserRouter ignores the Link viewTransition option (only data routers use it), so this wraps
 * the navigation itself. Browsers without View Transitions, modified clicks and reduced motion
 * fall through to the normal link.
 */
export function useCoverLinkClick() {
  const navigate = useNavigate();

  return (event: MouseEvent<HTMLAnchorElement>, to: string, preview: CoverPreview) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !canMorph()
    ) {
      return;
    }

    const cover = event.currentTarget.querySelector<HTMLElement>("[data-book-cover]");
    if (!cover) {
      return;
    }

    event.preventDefault();
    cover.style.viewTransitionName = COVER_TRANSITION_NAME;
    const state: CoverNavigationState = { coverPreview: preview };

    document.startViewTransition(() => {
      cover.style.viewTransitionName = "";
      flushSync(() => navigate(to, { state }));
    });
  };
}
