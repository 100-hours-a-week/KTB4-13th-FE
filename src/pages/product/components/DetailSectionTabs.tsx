import { useEffect, useRef, useState } from "react";

export interface DetailSection {
  id: string;
  label: string;
}

// Sticky tabs under the book header that jump to a section and follow the one being read.
export function DetailSectionTabs({ sections }: { sections: DetailSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const sectionKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const scroller = navRef.current?.closest("main");
    const targets = sectionKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!scroller || targets.length === 0) return undefined;

    // A section counts as "being read" when it crosses the upper middle of the scroll area.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { root: scroller, rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [sectionKey]);

  useEffect(() => {
    const tab = tabRefs.current.get(activeId);
    if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
  }, [activeId, sectionKey]);

  if (sections.length < 2) return null;

  const jumpTo = (id: string) => {
    setActiveId(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="상세 정보 바로가기"
      className="sticky top-0 z-10 -mx-5 border-b border-hairline bg-surface/95 px-5 backdrop-blur-sm"
      ref={navRef}
    >
      <div className="relative flex gap-5">
        {sections.map((section) => (
          <button
            aria-current={activeId === section.id ? "location" : undefined}
            className={`min-h-11 type-body-small ${
              activeId === section.id ? "font-semibold text-text-primary" : "text-text-tertiary"
            }`}
            data-press="none"
            key={section.id}
            onClick={() => jumpTo(section.id)}
            ref={(node) => {
              if (node) tabRefs.current.set(section.id, node);
              else tabRefs.current.delete(section.id);
            }}
            type="button"
          >
            {section.label}
          </button>
        ))}
        {indicator ? (
          <span
            aria-hidden="true"
            className="absolute bottom-0 h-0.5 rounded-full bg-primary transition-[left,width] duration-(--duration-base) ease-emphasized motion-reduce:transition-none"
            style={{ left: indicator.left, width: indicator.width }}
          />
        ) : null}
      </div>
    </nav>
  );
}
