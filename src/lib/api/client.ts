import { getToken } from "@/lib/utils";

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
   headers: {
  ...(options.body instanceof FormData
    ? {}
    : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "API Error");

  return data;
};