const QUESTION_ENDING = /(?:[?？]|추천|추천해\s*줘|알려\s*줘|골라\s*줘|읽고\s*싶어(?:요)?|할\s*때|필요할\s*때)$/;

export function looksLikeSentence(query: string) {
  const trimmed = query.trim();
  return trimmed.split(/\s+/).length >= 3 || QUESTION_ENDING.test(trimmed);
}
