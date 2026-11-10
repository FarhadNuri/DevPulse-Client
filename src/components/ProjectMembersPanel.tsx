import { useEffect, useState, useCallback, type FormEvent } from "react";
import { projects as projectsApi } from "../api";
import { useOrg, useConfirm } from "../hooks";
import type { ProjectMember, ProjectRole } from "../types";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import InviteClientModal from "./projects/InviteClientModal";

interface Props {
  orgId: number;
  projectId: number;
  projectName?: string;
}

export default function ProjectMembersPanel({
  orgId,
  projectId,
  projectName,
}: Props) {
  const { isMaintainer } = useOrg();
  const confirm = useConfirm();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [role, setRole] = useState<ProjectRole>("contributor");
  const [adding, setAdding] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [inviteClientModalOpen, setInviteClientModalOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectsApi.listMembers(orgId, projectId);
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
        ? (data as any).items
        : [];
      setMembers(list);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load members"
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, projectId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function handleRevoke(memberId: number) {
    const ok = await confirm({
      title: "Revoke Project Access",
      message: "Are you sure you want to revoke access for this member? They will no longer be able to collaborate on this project.",
      confirmText: "Revoke",
      variant: "danger",
    });
    if (!ok) return;
    setRevokingId(memberId);
    try {
      await projectsApi.revokeMember(orgId, projectId, memberId);
      toast.success("Access revoked");
      await loadMembers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke access"
      );
    } finally {
      setRevokingId(null);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) {
      toast.error("Please enter a member email address");
      return;
    }

    setAdding(true);
    try {
      const res = await projectsApi.addMember(orgId, projectId, {
        email: cleanEmail,
        role,
      });

      if ((res as any)?.invited) {
        toast.success(
          (res as any)?.message || `Invitation sent to ${cleanEmail}`
        );
      } else {
        toast.success(
          role === "client"
            ? "Client added to project"
            : "Contributor added to project"
        );
      }
      setEmailInput("");
      await loadMembers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  function getMemberName(m: ProjectMember): string {
    if (m.name) return m.name;
    if (m.user?.name) return m.user.name;
    const email = m.email || m.user?.email;
    if (email) return email.split("@")[0];
    const uid = m.user_id || m.user?.id;
    if (uid) return `User #${uid}`;
    return "Team Member";
  }

  function getMemberEmail(m: ProjectMember): string {
    return m.email || m.user?.email || "";
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const contributors = members.filter((m) => m.role !== "client");
  const clients = members.filter((m) => m.role === "client");

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Project Members
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Manage contributors working on this project and external clients with access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-bg-tertiary px-2.5 py-1 rounded text-text-secondary border border-border/40">
            {members.length} total
          </span>
          {isMaintainer && (
            <button
              onClick={() => setInviteClientModalOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Invite Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Member Directly Form (Maintainers Only) */}
      {isMaintainer && (
        <form
          onSubmit={handleAdd}
          className="bg-bg-tertiary/60 border border-border/80 rounded-lg p-4"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Directly Add Existing Org Member by Email
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              className="flex-1 bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
              placeholder="member@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={adding}
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectRole)}
              className="bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
              disabled={adding}
            >
              <option value="contributor">Contributor</option>
              <option value="client">Client</option>
            </select>
            <button
              type="submit"
              disabled={adding || !emailInput.trim()}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-50 cursor-pointer"
            >
              {adding ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {/* Section 1: Contributors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <span>Contributors</span>
            <span className="text-[11px] font-mono bg-bg-tertiary text-text-muted px-1.5 py-0.2 rounded">
              {contributors.length}
            </span>
          </h3>
          <span className="text-xs text-text-muted">
            Internal developers & team members
          </span>
        </div>

        <div className="space-y-2">
          {contributors.map((m) => {
            const memberName = getMemberName(m);
            const memberEmail = getMemberEmail(m);

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 bg-bg-tertiary border border-border/60 rounded-lg"
              >
                <div>
                  <div className="font-medium text-text-primary text-sm">
                    {memberName}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                    {memberEmail && <span>{memberEmail}</span>}
                    <span className="text-[11px] font-mono capitalize bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
                      {m.role}
                    </span>
                    <span className="text-[11px] text-green-400 capitalize">
                      {m.status}
                    </span>
                  </div>
                </div>
                {isMaintainer && (
                  <button
                    disabled={revokingId === m.id}
                    onClick={() => handleRevoke(m.id)}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {revokingId === m.id ? "Revoking..." : "Revoke"}
                  </button>
                )}
              </div>
            );
          })}

          {contributors.length === 0 && (
            <div className="text-center py-6 bg-bg-tertiary/30 border border-border/40 rounded-lg text-text-muted text-xs">
              No contributors assigned to this project.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Clients */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <span>Clients</span>
            <span className="text-[11px] font-mono bg-bg-tertiary text-text-muted px-1.5 py-0.2 rounded">
              {clients.length}
            </span>
          </h3>
          <span className="text-xs text-text-muted">
            External clients invited to submit & view tickets
          </span>
        </div>

        <div className="space-y-2">
          {clients.map((m) => {
            const memberName = getMemberName(m);
            const memberEmail = getMemberEmail(m);

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 bg-bg-tertiary border border-border/60 rounded-lg"
              >
                <div>
                  <div className="font-medium text-text-primary text-sm">
                    {memberName}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                    {memberEmail && <span>{memberEmail}</span>}
                    <span className="text-[11px] font-mono capitalize bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Client
                    </span>
                    <span className="text-[11px] text-green-400 capitalize">
                      {m.status}
                    </span>
                  </div>
                </div>
                {isMaintainer && (
                  <button
                    disabled={revokingId === m.id}
                    onClick={() => handleRevoke(m.id)}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {revokingId === m.id ? "Revoking..." : "Revoke"}
                  </button>
                )}
              </div>
            );
          })}

          {clients.length === 0 && (
            <div className="text-center py-6 bg-bg-tertiary/30 border border-border/40 rounded-lg text-text-muted text-xs">
              No clients invited to this project yet.
            </div>
          )}
        </div>
      </div>

      {/* Invite Client Modal */}
      <InviteClientModal
        open={inviteClientModalOpen}
        onClose={() => setInviteClientModalOpen(false)}
        onSuccess={loadMembers}
        orgId={orgId}
        projectId={projectId}
        projectName={projectName}
      />
    </div>
  );
}
