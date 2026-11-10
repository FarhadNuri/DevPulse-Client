import { useEffect, useState, useCallback } from "react";
import { projects as projectsApi } from "../api";
import type { ProjectAccessRequest } from "../types";
import toast from "react-hot-toast";
import Spinner from "./Spinner";

interface Props {
  orgId: number;
  projectId: number;
}

export default function AccessRequestsPanel({ orgId, projectId }: Props) {
  const [requests, setRequests] = useState<ProjectAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectsApi.listRequests(orgId, projectId);
      setRequests(data || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [orgId, projectId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleDecide(memberId: number, action: "approve" | "reject") {
    setProcessingId(memberId);
    try {
      await projectsApi.decideRequest(orgId, projectId, memberId, action);
      toast.success(`Request ${action}d`);
      await loadRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to decide request");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Access Requests</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Review organization members requesting access to this project.
          </p>
        </div>
        <span className="text-xs font-mono bg-bg-tertiary px-2 py-1 rounded text-text-secondary">
          {requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10 text-text-muted text-sm">
          No pending access requests.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const displayName = r.requester_name || r.user?.name || "Unknown user";
            const displayEmail = r.requester_email || r.user?.email || "";
            return (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-bg-tertiary border border-border/60 rounded-lg"
              >
                <div>
                  <div className="font-medium text-text-primary">
                    {displayName}
                  </div>
                  <div className="text-xs text-text-muted">
                    {displayEmail ? `${displayEmail} · ` : ""}Requested as {r.role || "contributor"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <button
                  disabled={processingId === r.id}
                  onClick={() => handleDecide(r.id, "approve")}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition disabled:opacity-50 cursor-pointer"
                >
                  Approve
                </button>
                <button
                  disabled={processingId === r.id}
                  onClick={() => handleDecide(r.id, "reject")}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3.5 py-1.5 rounded-md border border-red-500/30 transition disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

