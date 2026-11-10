import { request } from "./client";
import type { PaginatedActivityResponse } from "../types";

export async function getProjectActivity(
  orgId: number,
  projectId: number,
  options?: { limit?: number; before?: number }
): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.before) params.set("before", String(options.before));
  const qs = params.toString();
  return request<PaginatedActivityResponse>(
    `/api/orgs/${orgId}/projects/${projectId}/activity${qs ? `?${qs}` : ""}`
  );
}

export async function getIssueActivity(
  orgId: number,
  issueId: number,
  options?: { limit?: number; before?: number }
): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.before) params.set("before", String(options.before));
  const qs = params.toString();
  return request<PaginatedActivityResponse>(
    `/api/orgs/${orgId}/issues/${issueId}/activity${qs ? `?${qs}` : ""}`
  );
}

export async function getOrgActivity(
  orgId: number,
  options?: { limit?: number; before?: number; actor?: number; action?: string }
): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.before) params.set("before", String(options.before));
  if (options?.actor) params.set("actor", String(options.actor));
  if (options?.action) params.set("action", options.action);
  const qs = params.toString();
  return request<PaginatedActivityResponse>(
    `/api/orgs/${orgId}/activity${qs ? `?${qs}` : ""}`
  );
}

