import { parseApiResponse } from "@/common/api/apiResponse";

// Backend AuthLoginResponse and AuthReissueResponse share `{ accessToken: string }`.
export async function readAccessToken(response: Response) {
  const result = await parseApiResponse(response);

  if (!result.ok) {
    return null;
  }

  const { data } = result;

  if (
    typeof data !== "object" ||
    data === null ||
    !("accessToken" in data) ||
    typeof data.accessToken !== "string" ||
    !data.accessToken.trim()
  ) {
    return null;
  }

  return data.accessToken;
}
