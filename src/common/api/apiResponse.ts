// Mirrors backend common/response/ApiResponse; `data` is omitted when null.
export interface ApiSuccessResponse<TData> {
  data?: TData;
  success: true;
}

// Mirrors backend common/response/ErrorResponse; null fields are omitted.
export interface ApiErrorResponse {
  code: string;
  data?: unknown;
  message: string;
  success: false;
  traceId?: string;
}

export type ApiResult =
  | {
      data: unknown;
      ok: true;
      status: number;
    }
  | {
      error: ApiErrorResponse | null;
      ok: false;
      status: number;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiSuccessResponse(
  payload: unknown,
): payload is ApiSuccessResponse<unknown> {
  return isRecord(payload) && payload.success === true;
}

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  return (
    isRecord(payload) &&
    payload.success === false &&
    typeof payload.code === "string" &&
    typeof payload.message === "string"
  );
}

async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

// Validates only the envelope; callers narrow `data` to their own response type.
export async function parseApiResponse(response: Response): Promise<ApiResult> {
  let payload: unknown;

  try {
    payload = await readJsonBody(response);
  } catch {
    return { error: null, ok: false, status: response.status };
  }

  if (!response.ok) {
    return {
      error: isApiErrorResponse(payload) ? payload : null,
      ok: false,
      status: response.status,
    };
  }

  // Some endpoints (e.g. logout) answer 200 with an empty body.
  if (payload === undefined) {
    return { data: undefined, ok: true, status: response.status };
  }

  if (!isApiSuccessResponse(payload)) {
    return { error: null, ok: false, status: response.status };
  }

  return { data: payload.data, ok: true, status: response.status };
}
