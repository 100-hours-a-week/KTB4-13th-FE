import type {
  SearchRequestModel,
  SearchResultState,
} from "@/pages/search/types/search";

const doNothing = () => undefined;

export function useSearchResults(request: SearchRequestModel) {
  const state: SearchResultState = request.query
    ? { kind: "unavailable" }
    : { kind: "idle" };

  return {
    loadMore: doNothing,
    retry: doNothing,
    state,
  };
}
