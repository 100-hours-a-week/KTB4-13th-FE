const OLDEST_PUBLICATION_YEAR = 2000;

// Newest first, from this year back to the oldest year the filters offer.
export function getPublicationYears() {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - OLDEST_PUBLICATION_YEAR + 1 },
    (_, index) => currentYear - index,
  );
}
