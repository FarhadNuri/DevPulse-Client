import type { AuthResponse, CreateIssuePayload, Issue, UpdateIssuePayload, ApprovalAction, Comment } from "./types";

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
  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || "Request failed");
  }

  return json.data as T;
}

export const auth = {
  signup: (body: { name: string; email: string; password: string; role: string }) =>
    request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

export const issues = {
  list: () => request<Issue[]>("/api/issues"),

  pending: () => request<Issue[]>("/api/issues/pending"),

  create: (body: CreateIssuePayload) =>
    request<Issue>("/api/issues", { method: "POST", body: JSON.stringify(body) }),

  update: (id: number, body: UpdateIssuePayload) =>
    request<Issue>(`/api/issues/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  approve: (id: number, body: ApprovalAction) =>
    request<Issue>(`/api/issues/${id}/approve`, { method: "PATCH", body: JSON.stringify(body) }),

  remove: (id: number) =>
    request<void>(`/api/issues/${id}`, { method: "DELETE" }),
};

export const comments = {
  list: async (issueId: number): Promise<Comment[]> => {
    const token = getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/issues/${issueId}/comments`, { headers });
    const json = await res.json();

    if (!res.ok || json.success === false) {
      throw new Error(json.message || json.error || "Request failed");
    }

    return json.data as Comment[];
  },

  create: (issueId: number, body: string) => {
    const token = getToken();
    if (!token) throw new Error("Authentication required");
    
    return request<Comment>(`/api/issues/${issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  remove: (commentId: number) => {
    const token = getToken();
    if (!token) throw new Error("Authentication required");
    
    return request<void>(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
