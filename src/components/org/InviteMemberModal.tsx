import { useState, type FormEvent } from "react";
import { invitations as invitationsApi } from "../../api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: number;
  canInviteAdmin: boolean;
}

export default function InviteMemberModal({
  open,
  onClose,
  onSuccess,
  orgId,
  canInviteAdmin,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setError("");
    setLoading(true);

    try {
      await invitationsApi.createOrg(orgId, {
        email: cleanEmail,
        role,
      });
      toast.success(`Invitation sent to ${cleanEmail}`);
      setEmail("");
      setRole("member");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Invite Organization Member
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Send an invitation link via email to join your organization.
        </p>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              disabled={loading}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "admin")}
              disabled={loading}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
            >
              <option value="member">Member (view & request access to projects)</option>
              {canInviteAdmin && (
                <option value="admin">
                  Admin (manage projects, members, invitations)
                </option>
              )}
            </select>
            {!canInviteAdmin && (
              <p className="text-[11px] text-text-muted mt-1">
                Only organization owners can invite new Admins.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

