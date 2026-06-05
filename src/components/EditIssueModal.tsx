import { useState, useEffect, type FormEvent } from "react";
import { issues } from "../api";
import { useAuth } from "../hooks";
import type { Issue, IssueType, IssueStatus } from "../types";
import toast from "react-hot-toast";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  onUpdated: () => void;
}

export default function EditIssueModal({ open, onClose, issue, onUpdated }: Props) {
  const { isLoggedIn } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("bug");
  const [status, setStatus] = useState<IssueStatus>("open");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setType(issue.type);
      setStatus(issue.status);
    }
  }, [issue]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!issue) return;
    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    setLoading(true);
    try {
      await issues.update(issue._id, { title, description, type, status });
      toast.success("Issue updated");
      onUpdated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update issue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Issue">
      {!isLoggedIn ? (
        <p className="text-sm text-text-secondary">You must be signed in to edit issues.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              rows={3}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus transition"
            >
              <option value="bug">Bug</option>
              <option value="feature_request">Feature Request</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus transition"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md py-2 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </Modal>
  );
}
