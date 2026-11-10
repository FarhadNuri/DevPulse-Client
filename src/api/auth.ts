import { request } from "./client";
import type { AuthResponse, AuthMeResponse } from "../types";

export const auth = {
  signup: (body: {
    name: string;
    email: string;
    password: string;
    inviteToken?: string;
  }) =>
    request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<AuthMeResponse>("/api/auth/me"),
};

