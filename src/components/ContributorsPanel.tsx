import React, { useEffect, useState } from "react";
import { projects as projectsApi } from "../api";

export default function ContributorsPanel({ projectId }: { projectId: number }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [reqRes, contribRes] = await Promise.all([
        projectsApi.listRequests(String(projectId)),
        projectsApi.listContributors(String(projectId)),
      ]);
      setRequests(reqRes || []);
      setContributors(contribRes || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function decide(memberId: number, action: "approve" | "reject") {
    try {
      await projectsApi.decideRequest(String(projectId), String(memberId), action);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  async function revoke(memberId: number) {
    try {
      await projectsApi.revokeContributor(String(projectId), String(memberId));
      load();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    try {
      await projectsApi.addContributor(String(projectId), userId.trim());
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
      {requests.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-text-primary mb-3 border-b border-border pb-2">Access Requests</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-2 bg-bg-tertiary px-3 rounded-md border border-border/50">
                <span className="font-medium text-text-primary">{r.requester_name}</span>
                <div className="flex gap-2">
                  <button className="text-sm px-3 py-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 font-medium cursor-pointer" onClick={() => decide(r.id, "approve")}>Approve</button>
                  <button className="text-sm px-3 py-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium cursor-pointer" onClick={() => decide(r.id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg text-text-primary mb-3 border-b border-border pb-2">Contributors</h3>
        <div className="space-y-2 mb-4">
          {contributors.map((c) => (
            <div key={c.id} className="flex justify-between items-center py-2 bg-bg-tertiary px-3 rounded-md border border-border/50">
              <span className="font-medium text-text-primary">{c.name}</span>
              <button className="text-sm px-3 py-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium cursor-pointer" onClick={() => revoke(c.id)}>Revoke access</button>
            </div>
          ))}
          {contributors.length === 0 && <div className="text-text-muted text-sm py-2">No contributors yet.</div>}
        </div>

        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            className="bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition flex-1"
            placeholder="User ID of a client account"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}
