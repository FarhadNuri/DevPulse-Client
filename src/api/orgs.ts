import { request } from "./client";
import type { OrgSummary, OrgMember } from "../types";

export const orgs = {
  list: () => request<OrgSummary[]>("/api/orgs"),

  create: (name: string) =>
    request<OrgSummary>("/api/orgs", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  get: (orgId: number) => request<any>(`/api/orgs/${orgId}`),

  update: (orgId: number, body: { name?: string }) =>
    request<any>(`/api/orgs/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  members: (orgId: number) =>
    request<any>(`/api/orgs/${orgId}/members`).then((res) => {
      if (Array.isArray(res)) return res as OrgMember[];
      if (res && Array.isArray(res.items)) return res.items as OrgMember[];
      return [] as OrgMember[];
    }),

  updateMemberRole: (orgId: number, userId: number, role: "admin" | "member") =>
    request<any>(`/api/orgs/${orgId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  removeMember: (orgId: number, userId: number) =>
    request<void>(`/api/orgs/${orgId}/members/${userId}`, {
      method: "DELETE",
    }),

  transferOwnership: (orgId: number, userId: number) =>
    request<any>(`/api/orgs/${orgId}/transfer-ownership`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

