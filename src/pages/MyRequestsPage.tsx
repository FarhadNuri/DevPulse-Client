import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { issues as issuesApi } from "../api";
import type { Issue } from "../types";
import { formatDate, STATUS_LABELS } from "../utils";
import Spinner from "../components/Spinner";
import IssueDrawer from "../components/IssueDrawer";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export default function MyRequestsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const numOrgId = Number(orgId);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "all";
  const urlPage = Number(searchParams.get("page")) || 1;

  const [requests, setRequests] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resubmittingId, setResubmittingId] = useState<number | null>(null);

  const limit = 15;

  const fetchRequests = useCallback(async () => {
    if (isNaN(numOrgId) || numOrgId <= 0) return;
    try {
      setLoading(true);
      const res = await issuesApi.myRequests(numOrgId, {
        status: urlStatus !== "all" ? urlStatus : undefined,
        page: urlPage,
        limit,
      });
      setRequests(res.items || []);
      setTotal(res.total || 0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [numOrgId, urlStatus, urlPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  function handleFilterChange(newStatus: string) {
    const next = new URLSearchParams(searchParams);
    if (newStatus === "all") {
      next.delete("status");
    } else {
      next.set("status", newStatus);
    }
    next.set("page", "1");
    setSearchParams(next);
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  }

  function openIssueDrawer(id: number) {
    const next = new URLSearchParams(searchParams);
    next.set("issue", String(id));
    setSearchParams(next);
  }

  async function handleQuickResubmit(issueId: number) {
    setResubmittingId(issueId);
    try {
      await issuesApi.resubmit(numOrgId, issueId);
      toast.success("Request resubmitted for approval!");
      await fetchRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resubmit request");
    } finally {
      setResubmittingId(null);
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Requests</h1>
          <p className="text-sm text-text-muted mt-1">
            Track and manage tickets and feature requests submitted by you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={urlStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-bg-primary border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-border-focus transition cursor-pointer"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-bg-secondary border border-border rounded-xl">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            No requests found
          </h3>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            {urlStatus !== "all"
              ? `You don't have any requests matching the "${urlStatus}" filter.`
              : "You haven't submitted any tickets in this organization yet."}
          </p>
          <Link
            to={`/orgs/${numOrgId}/projects`}
            className="inline-block bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-md transition"
          >
            View Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-bg-tertiary/50">
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((req) => {
                    const isRejected = req.approval_status === "rejected";
                    const isPending = req.approval_status === "pending";

                    return (
                      <tr
                        key={req.id}
                        onClick={() => openIssueDrawer(req.id)}
                        className="hover:bg-bg-tertiary/30 transition cursor-pointer"
                      >
                        {/* Title & Preview */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-text-primary truncate">
                              {req.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                                req.type === "bug"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-purple-500/15 text-purple-400"
                              }`}
                            >
                              {req.type === "bug" ? "Bug" : "Feature"}
                            </span>
                          </div>

                          <p className="text-xs text-text-muted truncate mb-1">
                            {req.description}
                          </p>

                          {/* Rejection box if rejected */}
                          {isRejected && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-md text-xs text-red-400 space-y-1.5"
                            >
                              <div className="font-semibold flex items-center gap-1">
                                <span>⚠️ Rejected Reason:</span>
                              </div>
                              <div className="text-text-secondary text-[11px] whitespace-pre-wrap">
                                "{req.rejection_reason || "Please update your request details."}"
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => openIssueDrawer(req.id)}
                                  className="text-[11px] font-medium bg-bg-secondary hover:bg-bg-primary text-text-primary px-2.5 py-1 rounded border border-border transition cursor-pointer"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={resubmittingId === req.id}
                                  onClick={() => handleQuickResubmit(req.id)}
                                  className="text-[11px] font-medium bg-accent hover:bg-accent-hover text-white px-2.5 py-1 rounded transition disabled:opacity-50 cursor-pointer"
                                >
                                  {resubmittingId === req.id
                                    ? "Resubmitting..."
                                    : "🔄 Resubmit"}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isRejected ? (
                            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                              Rejected
                            </span>
                          ) : isPending ? (
                            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Approval
                            </span>
                          ) : (
                            <span
                              className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                req.status === "open"
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                  : req.status === "in_progress"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : "bg-green-500/15 text-green-400 border-green-500/30"
                              }`}
                            >
                              {STATUS_LABELS[req.status] || req.status}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs text-text-muted whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openIssueDrawer(req.id);
                            }}
                            className="text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-tertiary/30 text-xs">
                <span className="text-text-muted">
                  Showing {(urlPage - 1) * limit + 1} to{" "}
                  {Math.min(urlPage * limit, total)} of {total} requests
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={urlPage <= 1}
                    onClick={() => handlePageChange(urlPage - 1)}
                    className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                  >
                    ← Previous
                  </button>
                  <span className="px-2 text-text-muted">
                    Page {urlPage} of {totalPages}
                  </span>
                  <button
                    disabled={urlPage >= totalPages}
                    onClick={() => handlePageChange(urlPage + 1)}
                    className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer */}
      <IssueDrawer orgId={numOrgId} onIssueUpdated={fetchRequests} />
    </div>
  );
}
