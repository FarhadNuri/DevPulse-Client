import { request } from "./client";
import type {
  PublicInvitation,
  Invitation,
  AcceptInvitationResponse,
  MyPendingInvitation,
} from "../types";

export const invitations = {
  // Public route: inspect invitation details without credentials
  getPublic: (token: string) =>
    request<PublicInvitation>(`/api/invitations/${token}`),

  // Authenticated route: accept invitation with current user token
  accept: (token: string) =>
    request<AcceptInvitationResponse>(`/api/invitations/${token}/accept`, {
      method: "POST",
    }),

  // User-scoped pending invitations sent to logged-in email
  listMyPending: () =>
    request<MyPendingInvitation[]>("/api/invitations/my-pending").then((res) => {
      if (Array.isArray(res)) return res as MyPendingInvitation[];
      if (res && Array.isArray((res as any).items)) return (res as any).items as MyPendingInvitation[];
      return [] as MyPendingInvitation[];
    }),

  acceptMine: (invitationId: number) =>
    request<AcceptInvitationResponse>(`/api/invitations/${invitationId}/accept-mine`, {
      method: "POST",
    }),

  // Org-scoped invitations (Maintainers)
  listOrg: (orgId: number, status = "pending") =>
    request<any>(`/api/orgs/${orgId}/invitations?status=${status}`).then((res) => {
      if (Array.isArray(res)) return res as Invitation[];
      if (res && Array.isArray(res.items)) return res.items as Invitation[];
      return [] as Invitation[];
    }),

  createOrg: (
    orgId: number,
    body: { email: string; role?: "admin" | "member" },
  ) =>
    request<Invitation>(`/api/orgs/${orgId}/invitations`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  revokeOrg: (orgId: number, invitationId: number) =>
    request<{ id: number; status: string }>(
      `/api/orgs/${orgId}/invitations/${invitationId}`,
      {
        method: "DELETE",
      },
    ),

  resendOrg: (orgId: number, invitationId: number) =>
    request<{ id: number; expires_at: string; resend_count: number }>(
      `/api/orgs/${orgId}/invitations/${invitationId}/resend`,
      {
        method: "POST",
      },
    ),

  // Project-scoped client invitations (Maintainers)
  createClient: (orgId: number, projectId: number, body: { email: string }) =>
    request<Invitation>(
      `/api/orgs/${orgId}/projects/${projectId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
};

