import React, { useState } from "react";
import { projects as projectsApi } from "../api";
import Modal from "./Modal";
import toast from "react-hot-toast";

interface Props {
  orgId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewProjectModal({ orgId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    setLoading(true);
    try {
      await projectsApi.create(orgId, name.trim(), description.trim() || undefined);
      toast.success("Project created");
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setLoading(false);
    }
  }

  return (
    <Modal open={true} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 rounded-md p-3">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Project Name</label>
          <input
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
            placeholder="e.g. Website Revamp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Description (Optional)</label>
          <textarea
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
            placeholder="Brief description of the project"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md py-2.5 transition disabled:opacity-50 cursor-pointer"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </Modal>
  );
}
