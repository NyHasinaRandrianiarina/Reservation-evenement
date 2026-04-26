export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: unknown;
};

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: ApiFieldError[];
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorResponse;

  constructor(status: number, message: string, payload?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TBody> = {
  method: HttpMethod;
  path: string;
  body?: TBody;
  signal?: AbortSignal;
};

// En dev : pas de VITE_API_ORIGIN → les requêtes partent en relatif (proxy Vite → localhost:8000)
// En prod : VITE_API_ORIGIN = "https://ton-backend.railway.app"
const API_URL = import.meta.env.VITE_API_URL || "";
const API_BASE_URL = `${API_URL}/api/v1`;

export async function apiRequest<TResponse, TBody = unknown>(
  options: RequestOptions<TBody>,
): Promise<ApiSuccessResponse<TResponse>> {
  const res = await fetch(`${API_BASE_URL}${options.path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
    signal: options.signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const payload = (isJson ? await res.json() : undefined) as
    | ApiSuccessResponse<TResponse>
    | ApiErrorResponse
    | undefined;

  if (!res.ok) {
    const message =
      (payload && "message" in payload && payload.message) || res.statusText;
    throw new ApiError(res.status, message, payload && "success" in payload ? (payload as ApiErrorResponse) : undefined);
  }

  return payload as ApiSuccessResponse<TResponse>;
}
