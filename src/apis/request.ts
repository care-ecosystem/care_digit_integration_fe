const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_patient_token";

function getAccessToken(): string | null {
  const storedValue = localStorage.getItem(CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY);

  if (!storedValue) return null;

  try {
    const parsed = JSON.parse(storedValue);
    return parsed.token;
  } catch {
    // already plain token
    return storedValue;
  }
}

export class APIError extends Error {
  message: string;
  data: unknown;
  status: number;

  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.name = "AbortError";
    this.message = message;
    this.data = data;
    this.status = status;
  }
}

export async function request<Response>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<Response> {
  const BASE = window.CARE_API_URL;
  const url = `${BASE}${path}`;

  const isFormData = options?.body instanceof FormData;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // ✅ ONLY attach token if skipAuth is NOT true
  if (!options?.skipAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new APIError(
      data?.detail ?? JSON.stringify(data) ?? "Something went wrong",
      data,
      response.status,
    );
  }

  return data as Response;
}

export const queryString = (
  params?: Record<string, string | number | boolean | undefined>,
) => {
  if (!params) return "";
  const s = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  return s ? `?${s}` : "";
};
