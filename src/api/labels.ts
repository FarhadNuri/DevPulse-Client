import { request } from "./client";
import type { Label } from "../types";

export const labels = {
  list: (orgId: number) => request<Label[]>(`/api/orgs/${orgId}/labels`),

  create: (orgId: number, body: { name: string; color: string }) =>
    request<Label>(`/api/orgs/${orgId}/labels`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (orgId: number, labelId: number, body: { name?: string; color?: string }) =>
    request<Label>(`/api/orgs/${orgId}/labels/${labelId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (orgId: number, labelId: number) =>
    request<void>(`/api/orgs/${orgId}/labels/${labelId}`, {
      method: "DELETE",
    }),
};

