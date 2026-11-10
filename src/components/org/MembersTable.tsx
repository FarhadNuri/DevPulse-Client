import { useState } from "react";
import { useConfirm } from "../../hooks";
import type { OrgMember } from "../../types";

interface Props {
  members: OrgMember[];
  currentUserId?: number;
  isOwner: boolean;
  onRoleChange: (userId: number, newRole: "admin" | "member") => Promise<void>;
  onRemove: (userId: number) => Promise<void>;
}

export default function MembersTable({
  members,
  currentUserId,
  isOwner,
  onRoleChange,
  onRemove,
}: Props) {
  const confirm = useConfirm();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRoleSelect(userId: number, newRole: "admin" | "member") {
    setUpdatingId(userId);
    try {
      await onRoleChange(userId, newRole);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemoveClick(member: OrgMember) {
    const ok = await confirm({
      title: "Remove Member",
      message: `Are you sure you want to remove ${member.name || member.email} from this organization? They will lose access to all projects in this workspace.`,
      confirmText: "Remove Member",
      variant: "danger",
    });
    if (!ok) {
      return;
    }
    setRemovingId(member.user_id);
    try {
      await onRemove(member.user_id);
    } finally {
      setRemovingId(null);
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "owner":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
            Owner
          </span>
        );
      case "admin":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-semibold">
            Admin
          </span>
        );
      case "member":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-semibold">
            Member
          </span>
        );
      case "guest":
        return (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-zinc-500/15 text-zinc-300 border border-zinc-500/30 px-2 py-0.5 rounded font-semibold">
            Guest
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono uppercase bg-bg-tertiary text-text-muted px-2 py-0.5 rounded">
            {role}
          </span>
        );
    }
  }

  const memberList: OrgMember[] = Array.isArray(members)
    ? members
    : Array.isArray((members as any)?.items)
    ? (members as any).items
    : [];

  return (
    <div className="overflow-x-auto border border-border rounded-xl bg-bg-secondary">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-tertiary/70 text-xs uppercase font-semibold text-text-muted border-b border-border">
          <tr>
            <th className="px-5 py-3.5">User</th>
            <th className="px-5 py-3.5">Role</th>
            <th className="px-5 py-3.5">Joined</th>
            {isOwner && <th className="px-5 py-3.5 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {memberList.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const isTargetOwner = member.role === "owner";
            const canModify = isOwner && !isTargetOwner && !isSelf;

            return (
              <tr
                key={member.id}
                className="hover:bg-bg-tertiary/30 transition-colors"
              >
                {/* User info */}
                <td className="px-5 py-4">
                  <div className="font-medium text-text-primary">
                    {member.name || `User #${member.user_id}`}
                    {isSelf && (
                      <span className="ml-2 text-[10px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {member.email}
                  </div>
                </td>

                {/* Role & Role Selector */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}

                    {canModify &&
                      (member.role === "admin" || member.role === "member") && (
                        <select
                          value={member.role}
                          disabled={updatingId === member.user_id}
                          onChange={(e) =>
                            handleRoleSelect(
                              member.user_id,
                              e.target.value as "admin" | "member"
                            )
                          }
                          className="text-xs bg-bg-primary border border-border rounded px-2 py-1 text-text-secondary hover:text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                        >
                          <option value="member">Set Member</option>
                          <option value="admin">Set Admin</option>
                        </select>
                      )}
                  </div>
                </td>

                {/* Join Date */}
                <td className="px-5 py-4 text-xs text-text-muted">
                  {(() => {
                    const dateRaw = member.joined_at || member.created_at;
                    if (!dateRaw) return "Recently";
                    const d = new Date(dateRaw);
                    return isNaN(d.getTime())
                      ? "Recently"
                      : d.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                  })()}
                </td>

                {/* Actions */}
                {isOwner && (
                  <td className="px-5 py-4 text-right">
                    {canModify ? (
                      <button
                        onClick={() => handleRemoveClick(member)}
                        disabled={removingId === member.user_id}
                        className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                      >
                        {removingId === member.user_id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted italic">
                        {isTargetOwner ? "Owner" : isSelf ? "Your account" : "—"}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}

          {memberList.length === 0 && (
            <tr>
              <td
                colSpan={isOwner ? 4 : 3}
                className="px-5 py-8 text-center text-text-muted"
              >
                No organization members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

