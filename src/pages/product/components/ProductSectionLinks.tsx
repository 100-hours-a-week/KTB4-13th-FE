import { useState } from "react";

interface ProductSection {
  id: string;
  label: string;
}

export function ProductSectionLinks({ sections }: { sections: ProductSection[] }) {
  const [selectedId, setSelectedId] = useState(sections[0].id);
  const selectedIndex = Math.max(0, sections.findIndex(({ id }) => id === selectedId));

  return (
    <nav aria-label="도서 상세 구역" className="sticky top-0 z-10 -mx-5 border-b border-hairline bg-surface px-5">
      <div className="relative flex">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-transform duration-(--duration-base) ease-standard motion-reduce:transition-none"
          style={{
            width: `${100 / sections.length}%`,
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
        {sections.map(({ id, label }, index) => (
          <a
            aria-current={selectedIndex === index ? "location" : undefined}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-center px-1 text-center type-caption text-text-secondary aria-current:font-semibold aria-current:text-text-primary focus-visible:outline-2 focus-visible:outline-primary"
            href={`#${id}`}
            key={id}
            onClick={(event) => {
              const heading = document.getElementById(id);
              if (!heading) return;
              event.preventDefault();
              setSelectedId(id);
              heading.focus({ preventScroll: true });
              heading.scrollIntoView({ block: "start", behavior: "auto" });
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
