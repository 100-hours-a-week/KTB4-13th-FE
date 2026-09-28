import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";

// Backend revokes the refresh session and expires the refresh cookie; success has an empty body.
export async function requestLogout() {
  try {
    const response = await fetchWithAuth("/api/v1/auth/logout", {
      method: "POST",
    });
    const result = await parseApiResponse(response);

    return result.ok;
  } catch {
    return false;
  }
}
