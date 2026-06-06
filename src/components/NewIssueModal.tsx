import { useState, type FormEvent } from "react";
import { issues } from "../api";
import { useAuth } from "../hooks";
import type { IssueType } from "../types";
import toast from "react-hot-toast";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewIssueModal({ open, onClose, onCreated }: Props) {
  const { isLoggedIn, user } = useAuth();
  const [appName, setAppName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("bug");
  const [loading, setLoading] = useState(false);

  const isClient = user?.role === "client";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    if (isClient && !appName.trim()) {
      toast.error("App name is required");
      return;
    }
    setLoading(true);
    try {
      const payload: any = { title, description, type };
      if (isClient) {
        payload.app_name = appName;
      }
      await issues.create(payload);
      toast.success("Issue created");
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAppName("");
    setTitle("");
    setDescription("");
    setType("bug");
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={isClient ? "Submit Issue" : "New Issue"}>
      {!isLoggedIn ? (
        <p className="text-sm text-text-secondary">You must be signed in to create issues.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isClient && (
            <div>
              <label className="block text-sm text-text-secondary mb-1">App Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
                placeholder="e.g. MyShopApp"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
              placeholder="Issue title"
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
              placeholder="Describe the issue (min 20 chars)"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md py-2 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : isClient ? "Submit Issue" : "Create Issue"}
          </button>
        </form>
      )}
    </Modal>
  );
}
