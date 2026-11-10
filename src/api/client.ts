const BASE_URL = import.meta.env?.DEV
  ? "http://localhost:5000"
  : (import.meta.env.VITE_API_URL || "https://dev-pulse-l2-a2.vercel.app");

export function getToken(): string | null {
  try {
    return localStorage.getItem("devpulse_token");
  } catch {
    return null;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || "Request failed");
  }

  return (json.data !== undefined ? json.data : json) as T;
}

