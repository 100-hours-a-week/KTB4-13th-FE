import { useEffect, useId, useRef } from "react";

// still: never moves (header, older replies). idle: floats, looks around and blinks. welcome: idle plus one wave
// hello (first screen). thinking: waiting for a reply. talking: the reply text is being revealed.
// presenting: one hop as the cards appear, then idle.
export type BookjeogiMood = "still" | "idle" | "welcome" | "thinking" | "talking" | "presenting";

const BLINK_MS = 130;
const BLINK_MIN_GAP_MS = 2600;
const BLINK_GAP_SPREAD_MS = 2600;
const POKE_MS = 600;

// The owl drawn from public/assets/(nobg)bookjeok-character.png, split into parts so each part can move.
// Depth comes from gradients only (no blur filters, cheap on phones): light from the upper left, a rim light on the
// head, shade under the face, glossy eyes and a ground shadow that shrinks as 북적이 rises. Back (tufts), face, eyes and
// beak are separate layers so a look to the side moves the front ones more, which reads as the head turning.
// Motion lives in global.css (.bookjeogi-*); amplitudes are tuned for the 32–56px sizes used in chat.
// Blinking is not motion across the screen, so it keeps running when reduced motion is on; CSS gates the rest.
export function BookjeogiCharacter({ mood, pokeKey = 0 }: { mood: BookjeogiMood; pokeKey?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Several 북적이 can be on screen at once, so gradient ids must be unique per instance.
  const id = `bookjeogi${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const fill = (name: string) => `url(#${id}-${name})`;

  // Each new pokeKey replays one hop. Reading the layout between removing and setting the attribute makes a quick
  // second tap restart the hop instead of being merged into the running one.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || pokeKey === 0) return undefined;
    svg.removeAttribute("data-poke");
    svg.getBoundingClientRect();
    svg.setAttribute("data-poke", "");
    const timer = window.setTimeout(() => svg.removeAttribute("data-poke"), POKE_MS);
    return () => {
      window.clearTimeout(timer);
      svg.removeAttribute("data-poke");
    };
  }, [pokeKey]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || mood === "still") return undefined;
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
      <defs>
        <radialGradient cx="0.38" cy="0.28" id={`${id}-feather`} r="0.8">
          <stop offset="0" stopColor="#4d545b" />
          <stop offset="0.55" stopColor="#30353a" />
          <stop offset="1" stopColor="#1b1e21" />
        </radialGradient>
        <linearGradient id={`${id}-tuft`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#454b51" />
          <stop offset="1" stopColor="#24282b" />
        </linearGradient>
        <linearGradient id={`${id}-wing`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3d4349" />
          <stop offset="1" stopColor="#1f2225" />
        </linearGradient>
        <radialGradient cx="0.45" cy="0.35" id={`${id}-face`} r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f7f3ee" />
          <stop offset="1" stopColor="#e4dbd2" />
        </radialGradient>
        <radialGradient cx="0.45" cy="0.2" id={`${id}-belly`} r="0.9">
          <stop offset="0" stopColor="#fffdfa" />
          <stop offset="1" stopColor="#e6ddd4" />
        </radialGradient>
        <radialGradient id={`${id}-shade`}>
          <stop offset="0" stopColor="#3a2f2a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3a2f2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-cheek`}>
          <stop offset="0" stopColor="#ff8b8b" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#ff8b8b" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ff8b8b" stopOpacity="0" />
        </radialGradient>
        <radialGradient cx="0.4" cy="0.3" id={`${id}-eye`} r="0.75">
          <stop offset="0" stopColor="#474b50" />
          <stop offset="1" stopColor="#0e1011" />
        </radialGradient>
        <linearGradient id={`${id}-beak`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f48a9b" />
          <stop offset="1" stopColor="#d4526a" />
        </linearGradient>
        <radialGradient id={`${id}-ground`}>
          <stop offset="0" stopColor="#1b1e21" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1b1e21" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="bookjeogi-ground" cx="100" cy="194" fill={fill("ground")} rx="62" ry="7" />
      <g className="bookjeogi-body">
        <g className="bookjeogi-back">
          <path className="bookjeogi-tuft-left" d="M64 50C52 36 36 32 24 36C30 39 33 42 35 45C28 45 22 49 22 54C32 52 44 55 52 62Z" fill={fill("tuft")} />
          <path className="bookjeogi-tuft-right" d="M136 50C148 36 164 32 176 36C170 39 167 42 165 45C172 45 178 49 178 54C168 52 156 55 148 62Z" fill={fill("tuft")} />
        </g>
        <path d="M100 36C152 36 182 72 182 122C182 162 168 192 100 192C32 192 18 162 18 122C18 72 48 36 100 36Z" fill={fill("feather")} />
        <path d="M34 96C38 66 62 44 100 41" fill="none" stroke="#ffffff" strokeLinecap="round" strokeOpacity="0.2" strokeWidth="4" />
        <path d="M58 138C58 168 70 191 100 191C130 191 142 168 142 138Z" fill={fill("belly")} />
        <path d="M60 140C76 147 124 147 140 140L140 146C124 151 76 151 60 146Z" fill="#e8ddd5" />
        <ellipse cx="100" cy="150" fill={fill("shade")} rx="44" ry="9" />
        <g className="bookjeogi-wing-left">
          <path d="M20 150C21 130 40 134 56 145C67 156 67 176 60 191L32 191C23 182 20 166 20 150Z" fill={fill("wing")} />
          <path d="M25 160C28 175 33 185 41 191L32 191C25 183 22 172 25 160Z" fill="#4a5056" />
        </g>
        <g className="bookjeogi-wing-right">
          <path d="M180 150C179 130 160 134 144 145C133 156 133 176 140 191L168 191C177 182 180 166 180 150Z" fill={fill("wing")} />
          <path d="M175 160C172 175 167 185 159 191L168 191C175 183 178 172 175 160Z" fill="#4a5056" />
        </g>
        <g className="bookjeogi-face">
          <path d="M100 82C92 70 78 62 64 63C40 64 28 84 28 108C28 130 44 144 66 145L134 145C156 144 172 130 172 108C172 84 160 64 136 63C122 62 108 70 100 82Z" fill={fill("face")} />
          <ellipse cx="50" cy="119" fill={fill("cheek")} rx="13" ry="11" />
          <ellipse cx="150" cy="119" fill={fill("cheek")} rx="13" ry="11" />
          <g className="bookjeogi-gaze">
            <g className="bookjeogi-eye">
              <circle cx="68" cy="104" fill={fill("eye")} r="9.5" />
              <circle cx="65" cy="100.5" fill="#fff" r="3" />
              <circle cx="71.5" cy="108" fill="#fff" fillOpacity="0.55" r="1.4" />
            </g>
            <g className="bookjeogi-eye">
              <circle cx="132" cy="104" fill={fill("eye")} r="9.5" />
              <circle cx="129" cy="100.5" fill="#fff" r="3" />
              <circle cx="135.5" cy="108" fill="#fff" fillOpacity="0.55" r="1.4" />
            </g>
          </g>
          <g className="bookjeogi-nose">
            <path className="bookjeogi-beak" d="M92 109Q100 107 108 109Q104 116 100 121Q96 116 92 109Z" fill={fill("beak")} stroke="#e5677b" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </g>
        <path d="M91 153H109V172L100 166L91 172Z" fill={fill("beak")} stroke="#d95e72" strokeLinejoin="round" strokeWidth="2" />
      </g>
    </svg>
  );
}
