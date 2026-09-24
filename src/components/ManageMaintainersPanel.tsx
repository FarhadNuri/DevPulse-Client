import React, { useEffect, useState } from "react";
import { projects as projectsApi } from "../api";

export default function ManageMaintainersPanel({ projectId }: { projectId: number }) {
  const [maintainers, setMaintainers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await projectsApi.listMaintainers(String(projectId));
      setMaintainers(res || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    try {
      await projectsApi.addMaintainer(String(projectId), userId.trim());
      setUserId("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 mb-6 shadow-sm">
      <h3 className="font-semibold text-lg text-text-primary mb-3 border-b border-border pb-2">Maintainers</h3>
      <div className="space-y-2 mb-4">
        {maintainers.map((m) => (
          <div key={m.id} className="py-2 bg-bg-tertiary px-3 rounded-md font-medium text-text-primary border border-border/50">
            {m.name}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          className="bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition flex-1"
          placeholder="User ID of a maintainer account"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
