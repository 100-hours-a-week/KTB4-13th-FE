import { useEffect, useRef } from "react";

// still: never moves (header, older replies). idle: breathes and blinks. thinking: waiting for a reply.
// talking: the reply text is being revealed. presenting: one hop as the cards appear, then idle.
export type BookjeogiMood = "still" | "idle" | "thinking" | "talking" | "presenting";

const BLINK_MS = 130;
const BLINK_MIN_GAP_MS = 2600;
const BLINK_GAP_SPREAD_MS = 2600;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The owl drawn from public/assets/(nobg)bookjeok-character.png, split into parts so each part can move.
// Motion lives in global.css (.bookjeogi-*); amplitudes are tuned for the 36–64px sizes used in chat.
export function BookjeogiCharacter({ mood }: { mood: BookjeogiMood }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || mood === "still" || prefersReducedMotion()) return undefined;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        svg.setAttribute("data-blink", "");
        timer = window.setTimeout(() => {
          svg.removeAttribute("data-blink");
          schedule();
        }, BLINK_MS);
      }, BLINK_MIN_GAP_MS + Math.random() * BLINK_GAP_SPREAD_MS);
    };
    schedule();
    return () => {
      window.clearTimeout(timer);
      svg.removeAttribute("data-blink");
    };
  }, [mood]);

  return (
    <svg
      aria-hidden="true"
      className="bookjeogi size-full"
      data-mood={mood}
      focusable="false"
      ref={svgRef}
      viewBox="0 0 200 200"
    >
      <g className="bookjeogi-body">
        <path className="bookjeogi-tuft-left" d="M64 50C52 36 36 32 24 36C30 39 33 42 35 45C28 45 22 49 22 54C32 52 44 55 52 62Z" fill="#2c3034" />
        <path className="bookjeogi-tuft-right" d="M136 50C148 36 164 32 176 36C170 39 167 42 165 45C172 45 178 49 178 54C168 52 156 55 148 62Z" fill="#2c3034" />
        <path d="M100 36C152 36 182 72 182 122C182 162 168 192 100 192C32 192 18 162 18 122C18 72 48 36 100 36Z" fill="#2c3034" />
        <path d="M58 138C58 168 70 191 100 191C130 191 142 168 142 138Z" fill="#fbf9f5" />
        <path d="M60 140C76 147 124 147 140 140L140 146C124 151 76 151 60 146Z" fill="#efe6e1" />
        <path d="M100 82C92 70 78 62 64 63C40 64 28 84 28 108C28 130 44 144 66 145L134 145C156 144 172 130 172 108C172 84 160 64 136 63C122 62 108 70 100 82Z" fill="#fbf9f5" />
        <g className="bookjeogi-wing-left">
          <path d="M20 150C21 130 40 134 56 145C67 156 67 176 60 191L32 191C23 182 20 166 20 150Z" fill="#2c3034" />
          <path d="M25 160C28 175 33 185 41 191L32 191C25 183 22 172 25 160Z" fill="#474c52" />
        </g>
        <g className="bookjeogi-wing-right">
          <path d="M180 150C179 130 160 134 144 145C133 156 133 176 140 191L168 191C177 182 180 166 180 150Z" fill="#2c3034" />
          <path d="M175 160C172 175 167 185 159 191L168 191C175 183 178 172 175 160Z" fill="#474c52" />
        </g>
        <ellipse cx="50" cy="118" fill="#ff8b8b" rx="11" ry="9" />
        <ellipse cx="150" cy="118" fill="#ff8b8b" rx="11" ry="9" />
        <g className="bookjeogi-gaze">
          <g className="bookjeogi-eye">
            <circle cx="68" cy="104" fill="#1d1f21" r="9.5" />
            <circle cx="65" cy="100.5" fill="#fff" r="3" />
          </g>
          <g className="bookjeogi-eye">
            <circle cx="132" cy="104" fill="#1d1f21" r="9.5" />
            <circle cx="129" cy="100.5" fill="#fff" r="3" />
          </g>
        </g>
        <path className="bookjeogi-beak" d="M92 109Q100 107 108 109Q104 116 100 121Q96 116 92 109Z" fill="#e5677b" stroke="#e5677b" strokeLinejoin="round" strokeWidth="2" />
        <path d="M91 153H109V172L100 166L91 172Z" fill="#e5677b" stroke="#e5677b" strokeLinejoin="round" strokeWidth="2" />
      </g>
    </svg>
  );
}
