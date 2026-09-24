import React, { useState } from "react";
import { projects as projectsApi } from "../api";
import Modal from "./Modal";

export default function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await projectsApi.create(name.trim());
      onCreated();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <Modal open={true} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Project Name</label>
          <input
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
            placeholder="e.g. Acme Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md py-2 transition disabled:opacity-50 cursor-pointer" 
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </Modal>
  );
}
