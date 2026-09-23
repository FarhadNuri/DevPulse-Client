import React, { useEffect, useState } from "react";
import { projects as projectsApi } from "../api";

export default function AccessRequestsPanel({ projectId }: { projectId: number }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);

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

  if (requests.length === 0 && contributors.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      {requests.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-3 border-b pb-2">Access Requests</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-md">
                <span className="font-medium text-gray-700">{r.requester_name}</span>
                <div className="flex gap-3">
                  <button className="text-green-600 hover:text-green-800 font-medium" onClick={() => decide(r.id, "approve")}>Approve</button>
                  <button className="text-red-600 hover:text-red-800 font-medium" onClick={() => decide(r.id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contributors.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-3 border-b pb-2">Contributors</h3>
          <div className="space-y-2">
            {contributors.map((c) => (
              <div key={c.id} className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-md">
                <span className="font-medium text-gray-700">{c.name}</span>
                <button className="text-red-600 hover:text-red-800 font-medium" onClick={() => revoke(c.id)}>Revoke access</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
