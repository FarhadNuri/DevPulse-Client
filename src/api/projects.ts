import { request } from "./client";
import type { Project, ProjectMember, ProjectAccessRequest } from "../types";

export const projects = {
  list: (orgId: number, archived = false) =>
    request<Project[]>(`/api/orgs/${orgId}/projects?archived=${archived}`),

  create: (orgId: number, name: string, description?: string) =>
    request<Project>(`/api/orgs/${orgId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),

  get: (orgId: number, projectId: number) =>
    request<Project>(`/api/orgs/${orgId}/projects/${projectId}`),

  update: (
    orgId: number,
    projectId: number,
    body: { name?: string; description?: string },
  ) =>
    request<Project>(`/api/orgs/${orgId}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  requestAccess: (orgId: number, projectId: number) =>
    request<any>(`/api/orgs/${orgId}/projects/${projectId}/request-access`, {
      method: "POST",
    }),

  listRequests: (orgId: number, projectId: number) =>
    request<ProjectAccessRequest[]>(
      `/api/orgs/${orgId}/projects/${projectId}/access-requests`,
    ),

  decideRequest: (
    orgId: number,
    projectId: number,
    memberId: number,
    action: "approve" | "reject",
  ) =>
    request<any>(
      `/api/orgs/${orgId}/projects/${projectId}/access-requests/${memberId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ action }),
      },
    ),

  listMembers: (orgId: number, projectId: number) =>
    request<ProjectMember[]>(`/api/orgs/${orgId}/projects/${projectId}/members`),

  members: (orgId: number, projectId: number) =>
    request<ProjectMember[]>(`/api/orgs/${orgId}/projects/${projectId}/members`),

  addMember: (
    orgId: number,
    projectId: number,
    target: { email?: string; userId?: number; role?: "contributor" | "client" } | number,
    role: "contributor" | "client" = "contributor",
  ) => {
    const payload =
      typeof target === "number"
        ? { userId: target, role }
        : { role, ...target };

    return request<ProjectMember>(
      `/api/orgs/${orgId}/projects/${projectId}/members`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  revokeMember: (orgId: number, projectId: number, memberId: number) =>
    request<any>(
      `/api/orgs/${orgId}/projects/${projectId}/members/${memberId}/revoke`,
      {
        method: "PATCH",
      },
    ),
};

