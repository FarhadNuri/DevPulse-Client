import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { orgs as orgsApi, invitations as invitationsApi } from "../api";
import { useAuth, useOrg, useConfirm } from "../hooks";
import type { OrgMember, Invitation } from "../types";
import MembersTable from "../components/org/MembersTable";
import InviteMemberModal from "../components/org/InviteMemberModal";
import ManageLabelsPanel from "../components/org/ManageLabelsPanel";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

type Tab = "members" | "invitations" | "labels";

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const numOrgId = Number(orgId);
  const { user } = useAuth();
  const { isMaintainer, isOwner, currentOrg } = useOrg();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(
    null
  );

  // Load members
  const loadMembers = useCallback(async () => {
    if (isNaN(numOrgId) || numOrgId <= 0) return;
    try {
      setLoadingMembers(true);
      const data = await orgsApi.members(numOrgId);
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
        ? (data as any).items
        : [];
      setMembers(list);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load organization members"
      );
    } finally {
      setLoadingMembers(false);
    }
  }, [numOrgId]);

  // Load invitations
  const loadInvitations = useCallback(async () => {
    if (isNaN(numOrgId) || numOrgId <= 0) return;
    try {
      setLoadingInvites(true);
      const data = await invitationsApi.listOrg(numOrgId, "pending");
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
        ? (data as any).items
        : [];
      setInvitations(list);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load invitations"
      );
    } finally {
      setLoadingInvites(false);
    }
  }, [numOrgId]);

  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [loadMembers, loadInvitations]);

  // If not maintainer (i.e. regular member or guest), redirect
  if (!isMaintainer) {
    return <Navigate to={`/orgs/${numOrgId}/projects`} replace />;
  }

  async function handleRoleChange(userId: number, newRole: "admin" | "member") {
    try {
      await orgsApi.updateMemberRole(numOrgId, userId, newRole);
      toast.success("Member role updated");
      await loadMembers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update member role"
      );
    }
  }

  async function handleRemoveMember(userId: number) {
    try {
      await orgsApi.removeMember(numOrgId, userId);
      toast.success("Member removed from organization");
      await loadMembers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member"
      );
    }
  }

  async function handleResendInvite(inviteId: number) {
    setActionInProgressId(inviteId);
    try {
      await invitationsApi.resendOrg(numOrgId, inviteId);
      toast.success("Invitation resent successfully");
      await loadInvitations();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitation"
      );
    } finally {
      setActionInProgressId(null);
    }
  }

  async function handleRevokeInvite(inviteId: number) {
    const ok = await confirm({
      title: "Revoke Invitation",
      message: "Are you sure you want to revoke this invitation? The invite link will immediately become invalid.",
      confirmText: "Revoke",
      variant: "danger",
    });
    if (!ok) return;
    setActionInProgressId(inviteId);
    try {
      await invitationsApi.revokeOrg(numOrgId, inviteId);
      toast.success("Invitation revoked");
      await loadInvitations();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke invitation"
      );
    } finally {
      setActionInProgressId(null);
    }
  }

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Organization Settings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage members and pending invitations for{" "}
            <span className="font-semibold text-text-primary">
              {currentOrg?.name || "this organization"}
            </span>
          </p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md font-medium text-sm transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Invite Member</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 px-3 text-sm font-medium transition cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === "members"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Members</span>
          <span className="text-xs font-mono bg-bg-tertiary px-2 py-0.5 rounded text-text-muted">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("invitations")}
          className={`pb-3 px-3 text-sm font-medium transition cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === "invitations"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Invitations</span>
          <span className="text-xs font-mono bg-bg-tertiary px-2 py-0.5 rounded text-text-muted">
            {invitations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("labels")}
          className={`pb-3 px-3 text-sm font-medium transition cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === "labels"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <span>Labels</span>
        </button>
      </div>

      {/* Tab Content: Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Active Organization Members
            </h2>
            <span className="text-xs text-text-muted">
              {isOwner
                ? "As Owner, you can change roles and remove members."
                : "You have view access to the organization member list."}
            </span>
          </div>

          {loadingMembers ? (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <MembersTable
              members={members}
              currentUserId={user?.id}
              isOwner={isOwner}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
            />
          )}
        </div>
      )}

      {/* Tab Content: Invitations */}
      {activeTab === "invitations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Pending Invitations
            </h2>
            <span className="text-xs text-text-muted">
              Invitations expire 7 days after issue date.
            </span>
          </div>

          {loadingInvites ? (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-16 bg-bg-secondary border border-border rounded-xl">
              <h3 className="text-base font-medium text-text-primary mb-1">
                No pending invitations
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto mb-4">
                All sent invitations have been accepted or have expired.
              </p>
              <button
                onClick={() => setInviteModalOpen(true)}
                className="bg-accent hover:bg-accent-hover text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
              >
                + Invite Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl bg-bg-secondary">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-tertiary/70 text-xs uppercase font-semibold text-text-muted border-b border-border">
                  <tr>
                    <th className="px-5 py-3.5">Recipient</th>
                    <th className="px-5 py-3.5">Role / Scope</th>
                    <th className="px-5 py-3.5">Sent</th>
                    <th className="px-5 py-3.5">Expires</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invitations.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-bg-tertiary/30 transition-colors"
                    >
                      {/* Recipient */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-text-primary">
                          {inv.email}
                        </div>
                        {inv.resend_count && inv.resend_count > 0 ? (
                          <div className="text-[11px] text-text-muted">
                            Resent {inv.resend_count} time
                            {inv.resend_count > 1 ? "s" : ""}
                          </div>
                        ) : null}
                      </td>

                      {/* Scope & Role */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${
                              inv.role === "admin"
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                : inv.role === "client"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                            }`}
                          >
                            {inv.role}
                          </span>
                          {inv.project_id && (
                            <span className="text-xs text-text-muted">
                              (Project #{inv.project_id})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sent Date */}
                      <td className="px-5 py-4 text-xs text-text-muted">
                        {new Date(inv.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>

                      {/* Expiration */}
                      <td className="px-5 py-4 text-xs text-text-muted">
                        {new Date(inv.expires_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleResendInvite(inv.id)}
                          disabled={actionInProgressId === inv.id}
                          className="text-xs text-text-secondary hover:text-text-primary bg-bg-tertiary hover:bg-bg-primary px-3 py-1.5 rounded border border-border transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionInProgressId === inv.id
                            ? "Working..."
                            : "Resend"}
                        </button>
                        <button
                          onClick={() => handleRevokeInvite(inv.id)}
                          disabled={actionInProgressId === inv.id}
                          className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Labels */}
      {activeTab === "labels" && <ManageLabelsPanel orgId={numOrgId} />}

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          loadMembers();
          loadInvitations();
        }}
        orgId={numOrgId}
        canInviteAdmin={isOwner}
      />
    </div>
  );
}

