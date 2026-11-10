// A query that reads like a wish ("위로가 필요할 때") rather than a title or an author.
const SENTENCE_HINT = /(추천|줘|싶|때$|할 때|\?|어떤|읽을|같은 책|느낌)/;

export function looksLikeSentence(query: string) {
  const trimmed = query.trim();

  return trimmed.split(/\s+/).length >= 3 || SENTENCE_HINT.test(trimmed);
}
