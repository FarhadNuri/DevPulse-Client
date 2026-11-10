import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { adminApi } from "../../api";
import { useConfirm } from "../../hooks";
import type { AdminOrg } from "../../types";
import Spinner from "../../components/Spinner";

export default function AdminOrgsPage() {
  const confirm = useConfirm();
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Delete modal state
  const [orgToDelete, setOrgToDelete] = useState<AdminOrg | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listOrgs({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setOrgs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  async function handleToggleStatus(org: AdminOrg) {
    const nextStatus = org.status === "active" ? "suspended" : "active";
    const actionLabel = nextStatus === "suspended" ? "suspend" : "activate";

    const ok = await confirm({
      title: `${nextStatus === "suspended" ? "Suspend" : "Activate"} Organization`,
      message: `Are you sure you want to ${actionLabel} "${org.name}"?${
        nextStatus === "suspended" ? " Members will lose write access to their projects." : ""
      }`,
      confirmText: nextStatus === "suspended" ? "Suspend" : "Activate",
      variant: nextStatus === "suspended" ? "danger" : "primary",
    });

    if (!ok) {
      return;
    }

    setActionLoadingId(org.id);
    try {
      await adminApi.updateOrgStatus(org.id, nextStatus);
      toast.success(`Organization ${nextStatus === "suspended" ? "suspended" : "activated"}`);
      fetchOrgs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update organization status");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!orgToDelete) return;
    if (confirmNameInput !== orgToDelete.name) {
      toast.error("Organization name does not match");
      return;
    }

    setDeleting(true);
    try {
      await adminApi.deleteOrg(orgToDelete.id, confirmNameInput);
      toast.success(`Organization "${orgToDelete.name}" deleted permanently`);
      setOrgToDelete(null);
      setConfirmNameInput("");
      fetchOrgs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Organizations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage all organizations across the platform ({total} total)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search organizations..."
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "suspended");
              setPage(1);
            }}
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-tertiary border-b border-border text-xs uppercase font-mono tracking-wider text-text-muted">
              <tr>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-center">Members</th>
                <th className="py-3 px-4 text-center">Projects</th>
                <th className="py-3 px-4 text-center">Issues</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <Spinner />
                  </td>
                </tr>
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No organizations found matching your search.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => {
                  const isActionLoading = actionLoadingId === org.id;
                  return (
                    <tr key={org.id} className="hover:bg-bg-tertiary/40 transition">
                      <td className="py-3 px-4">
                        <Link
                          to={`/orgs/${org.id}/projects`}
                          className="font-medium text-text-primary hover:text-accent transition flex items-center gap-1.5"
                          title="Open organization as Super Admin"
                        >
                          <span>{org.name}</span>
                          <span className="text-[11px] text-text-muted font-mono">
                            ({org.slug})
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary">
                          {org.owner.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {org.owner.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {org.member_count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {org.project_count}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {org.issue_count}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            org.status === "active"
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-muted font-mono">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(org)}
                            disabled={isActionLoading}
                            className={`text-xs px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
                              org.status === "active"
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                            } disabled:opacity-50`}
                          >
                            {isActionLoading
                              ? "..."
                              : org.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() => {
                              setOrgToDelete(org);
                              setConfirmNameInput("");
                            }}
                            className="text-xs px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div>
            Showing Page <span className="font-semibold text-text-primary">{page}</span> of{" "}
            <span className="font-semibold text-text-primary">{totalPages}</span> ({total} items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded bg-bg-tertiary hover:bg-bg-primary text-text-primary border border-border disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded bg-bg-tertiary hover:bg-bg-primary text-text-primary border border-border disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {orgToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-text-primary">
                Delete Organization
              </h3>
            </div>

            <p className="text-sm text-text-muted leading-relaxed">
              This action is <span className="font-semibold text-red-400">permanent and irreversible</span>. All projects, issues, comments, attachments, and data belonging to{" "}
              <span className="font-semibold text-text-primary">{orgToDelete.name}</span> will be permanently deleted.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs text-text-muted">
                Please type <span className="font-mono text-text-primary font-semibold">{orgToDelete.name}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={orgToDelete.name}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-red-500 font-mono"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrgToDelete(null);
                  setConfirmNameInput("");
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-primary text-text-primary text-sm font-medium border border-border transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={confirmNameInput !== orgToDelete.name || deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px] h-9"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Organization</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
