// AI writes answer options into `followup` as lines that start with "• " (AI #652).
// Each option is the exact text the user would send, so tapping one sends it as a message.
const OPTION_PREFIX = "• ";

export interface SplitFollowup {
  options: string[];
  text: string | null;
}

export function splitFollowup(followup: string | null | undefined): SplitFollowup {
  if (!followup) return { options: [], text: null };

  const options: string[] = [];
  const textLines: string[] = [];
  for (const line of followup.split("\n")) {
    if (line.startsWith(OPTION_PREFIX)) {
      const option = line.slice(OPTION_PREFIX.length).trim();
      if (option && !options.includes(option)) options.push(option);
    } else {
      textLines.push(line);
    }
  }
  const text = textLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { options, text: text || null };
}

// "과" after a final consonant, "와" otherwise. Digits follow how they are read (영, 일, 삼, 육, 칠, 팔 end in one).
function withParticle(word: string) {
  const last = word.trimEnd().at(-1) ?? "";
  const code = last.charCodeAt(0);
  const isHangul = code >= 0xac00 && code <= 0xd7a3;
  const hasFinal = isHangul ? (code - 0xac00) % 28 !== 0 : "013678".includes(last);
  return hasFinal ? "과" : "와";
}

// The AI reads "『제목』" plus "비슷한 책 더" as a request for that book's similar-readers list.
export function similarBooksMessage(title: string) {
  return `『${title}』${withParticle(title)} 비슷한 책 더 보여줘`;
}
