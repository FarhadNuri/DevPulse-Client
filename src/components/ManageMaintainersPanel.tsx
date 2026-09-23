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
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-3 border-b pb-2">Maintainers</h3>
      <div className="space-y-2 mb-4">
        {maintainers.map((m) => (
          <div key={m.id} className="py-2 bg-gray-50 px-3 rounded-md font-medium text-gray-700">
            {m.name}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          className="border border-gray-300 p-2.5 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="User ID of a maintainer account"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
