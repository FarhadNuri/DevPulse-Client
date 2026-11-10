import { useState, type FormEvent } from "react";
import { invitations as invitationsApi } from "../../api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: number;
  projectId: number;
  projectName?: string;
}

export default function InviteClientModal({
  open,
  onClose,
  onSuccess,
  orgId,
  projectId,
  projectName,
}: Props) {
  const [email, setEmail] = useState("");
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
      await invitationsApi.createClient(orgId, projectId, {
        email: cleanEmail,
      });
      toast.success(`Client invitation sent to ${cleanEmail}`);
      setEmail("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send client invitation"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Invite Client
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Invite an external client to access{" "}
          <span className="font-semibold text-text-primary">
            {projectName ? `"${projectName}"` : "this project"}
          </span>
          . Clients will only see this project and will join your organization as a guest.
        </p>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Client Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              required
              disabled={loading}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
              autoFocus
            />
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
              {loading ? "Sending..." : "Send Client Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

