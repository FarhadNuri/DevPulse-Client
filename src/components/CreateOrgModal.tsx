import { useState, type FormEvent } from "react";
import { orgs as orgsApi } from "../api";
import { useAuth, useOrg } from "../hooks";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateOrgModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshMe } = useAuth();
  const { switchOrg } = useOrg();

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    setLoading(true);

    try {
      const newOrg = await orgsApi.create(name.trim());
      await refreshMe();
      toast.success("Organization created");
      onClose();
      setName("");
      switchOrg(newOrg.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Create Organization</h2>
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-md p-3 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Organization Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-border-focus"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

