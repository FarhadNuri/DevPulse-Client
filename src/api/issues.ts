import { request } from "./client";
import type { Issue, CreateIssuePayload, UpdateIssuePayload, PaginatedResult } from "../types";

export const issues = {
  list: async (
    orgId: number,
    projectId: number,
    params?: {
      search?: string;
      status?: string;
      type?: string;
      assignee?: string;
      label?: string | string[];
      sort?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResult<Issue>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);
    if (params?.type && params.type !== "all") searchParams.set("type", params.type);
    if (params?.assignee && params.assignee !== "all") searchParams.set("assignee", params.assignee);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    if (params?.label) {
      if (Array.isArray(params.label)) {
        params.label.forEach((lbl) => searchParams.append("label", lbl));
      } else {
        searchParams.append("label", params.label);
      }
    }

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await request<any>(`/api/orgs/${orgId}/projects/${projectId}/issues${qs}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length };
    }
    return {
      items: res?.items || [],
      total: Number(res?.total) || (res?.items?.length || 0),
      page: Number(res?.page) || 1,
      limit: Number(res?.limit) || 20,
    };
  },

  pending: async (
    orgId: number,
    params?: { projectId?: number; page?: number; limit?: number },
  ): Promise<Issue[]> => {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.set("projectId", String(params.projectId));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await request<any>(`/api/orgs/${orgId}/issues/pending${qs}`);
    return Array.isArray(res) ? res : res?.items || [];
  },

  create: (orgId: number, projectId: number, body: CreateIssuePayload) =>
    request<Issue>(`/api/orgs/${orgId}/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  get: (orgId: number, issueId: number) =>
    request<Issue>(`/api/orgs/${orgId}/issues/${issueId}`),

  update: (orgId: number, issueId: number, body: UpdateIssuePayload) =>
    request<Issue>(`/api/orgs/${orgId}/issues/${issueId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (orgId: number, issueId: number) =>
    request<void>(`/api/orgs/${orgId}/issues/${issueId}`, {
      method: "DELETE",
    }),

  approve: (
    orgId: number,
    issueId: number,
    body: { action: "approved" | "rejected"; reason?: string },
  ) =>
    request<Issue>(`/api/orgs/${orgId}/issues/${issueId}/approve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  resubmit: (orgId: number, issueId: number) =>
    request<Issue>(`/api/orgs/${orgId}/issues/${issueId}/resubmit`, {
      method: "POST",
    }),

  myRequests: async (
    orgId: number,
    params?: { status?: string; projectId?: number; page?: number; limit?: number },
  ): Promise<PaginatedResult<Issue>> => {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);
    if (params?.projectId) searchParams.set("projectId", String(params.projectId));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await request<any>(`/api/orgs/${orgId}/my-requests${qs}`);
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length };
    }
    return {
      items: res?.items || [],
      total: Number(res?.total) || (res?.items?.length || 0),
      page: Number(res?.page) || 1,
      limit: Number(res?.limit) || 20,
    };
  },
};
