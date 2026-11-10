import { request } from "./client";
import type { Comment, MentionableUser } from "../types";

export const comments = {
  list: (orgId: number, issueId: number): Promise<Comment[]> =>
    request<Comment[]>(`/api/orgs/${orgId}/issues/${issueId}/comments`),

  create: (orgId: number, issueId: number, body: string, mentions?: number[]) =>
    request<Comment>(`/api/orgs/${orgId}/issues/${issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body, mentions }),
    }),

  remove: (orgId: number, commentId: number) =>
    request<void>(`/api/orgs/${orgId}/comments/${commentId}`, {
      method: "DELETE",
    }),

  getMentionable: (orgId: number, projectId: number) =>
    request<MentionableUser[]>(`/api/orgs/${orgId}/projects/${projectId}/mentionable`),
};

