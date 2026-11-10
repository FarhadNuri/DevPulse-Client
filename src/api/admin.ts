import { request } from "./client";
import type {
  AdminStats,
  AdminOrg,
  AdminOrgDetail,
  AdminUser,
  AdminUserDetail,
  AdminProject,
  AdminIssue,
  PaginatedResult,
} from "../types";

export interface ListAdminOrgsParams {
  page?: number;
  limit?: number;
  status?: "active" | "suspended";
  active_recent_days?: number;
  search?: string;
}

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
  status?: "active" | "disabled";
  recent_days?: number;
  search?: string;
}

export interface ListAdminProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListAdminIssuesParams {
  page?: number;
  limit?: number;
  search?: string;
  approval_status?: string;
  status?: string;
}

export const adminApi = {
  stats: () => request<AdminStats>("/api/admin/stats"),

  listOrgs: (params: ListAdminOrgsParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    if (params.active_recent_days) qs.set("active_recent_days", String(params.active_recent_days));
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return request<PaginatedResult<AdminOrg>>(`/api/admin/orgs${query ? `?${query}` : ""}`);
  },

  getOrg: (orgId: number) => request<AdminOrgDetail>(`/api/admin/orgs/${orgId}`),

  updateOrgStatus: (orgId: number, status: "active" | "suspended") =>
    request<AdminOrg>(`/api/admin/orgs/${orgId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteOrg: (orgId: number, confirm_name: string) =>
    request<void>(`/api/admin/orgs/${orgId}`, {
      method: "DELETE",
      body: JSON.stringify({ confirm_name }),
    }),

  listUsers: (params: ListAdminUsersParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    if (params.recent_days) qs.set("recent_days", String(params.recent_days));
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return request<PaginatedResult<AdminUser>>(`/api/admin/users${query ? `?${query}` : ""}`);
  },

  getUser: (userId: number) => request<AdminUserDetail>(`/api/admin/users/${userId}`),

  updateUserStatus: (userId: number, status: "active" | "disabled") =>
    request<AdminUser>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateSuperAdmin: (userId: number, value: boolean) =>
    request<AdminUser>(`/api/admin/users/${userId}/super-admin`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  listProjects: (params: ListAdminProjectsParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return request<PaginatedResult<AdminProject>>(`/api/admin/projects${query ? `?${query}` : ""}`);
  },

  listIssues: (params: ListAdminIssuesParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    if (params.approval_status) qs.set("approval_status", params.approval_status);
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return request<PaginatedResult<AdminIssue>>(`/api/admin/issues${query ? `?${query}` : ""}`);
  },
};
