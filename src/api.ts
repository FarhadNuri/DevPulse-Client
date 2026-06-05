import type { AuthResponse, CreateIssuePayload, Issue, UpdateIssuePayload } from "./types";

const BASE_URL = "https://dev-pulse-l2-a2.vercel.app";

function getToken(): string | null {
  return localStorage.getItem("devpulse_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
}

export const auth = {
  signup: (body: { name: string; email: string; password: string; role: string }) =>
    request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

export const issues = {
  list: () => request<Issue[]>("/api/issues"),

  create: (body: CreateIssuePayload) =>
    request<Issue>("/api/issues", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: UpdateIssuePayload) =>
    request<Issue>(`/api/issues/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<void>(`/api/issues/${id}`, { method: "DELETE" }),
};
