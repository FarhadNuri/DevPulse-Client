import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { adminApi } from "../../api";
import type { AdminUser } from "../../types";
import { useAuth, useConfirm } from "../../hooks";
import Spinner from "../../components/Spinner";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleStatus(u: AdminUser) {
    const nextStatus = u.status === "active" ? "disabled" : "active";
    const actionLabel = nextStatus === "disabled" ? "disable" : "enable";

    const ok = await confirm({
      title: `${nextStatus === "disabled" ? "Disable" : "Enable"} User`,
      message: `Are you sure you want to ${actionLabel} "${u.name}" (${u.email})?${
        nextStatus === "disabled" ? " The user will immediately be locked out of the platform." : ""
      }`,
      confirmText: nextStatus === "disabled" ? "Disable" : "Enable",
      variant: nextStatus === "disabled" ? "danger" : "primary",
    });

    if (!ok) {
      return;
    }

    setActionLoadingId(u.id);
    try {
      await adminApi.updateUserStatus(u.id, nextStatus);
      toast.success(`User ${nextStatus === "disabled" ? "disabled" : "enabled"}`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleSuperAdmin(u: AdminUser) {
    const nextValue = !u.is_super_admin;
    const actionLabel = nextValue ? "promote to Super Admin" : "demote from Super Admin";

    const ok = await confirm({
      title: `${nextValue ? "Promote to" : "Demote from"} Super Admin`,
      message: `Are you sure you want to ${actionLabel} for "${u.name}" (${u.email})?`,
      confirmText: nextValue ? "Promote" : "Demote",
      variant: nextValue ? "primary" : "danger",
    });

    if (!ok) {
      return;
    }

    setActionLoadingId(u.id);
    try {
      await adminApi.updateSuperAdmin(u.id, nextValue);
      toast.success(nextValue ? `${u.name} promoted to Super Admin` : `${u.name} demoted`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update super admin status");
    } finally {
      setActionLoadingId(null);
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Platform Users
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage user accounts, platform permissions, and account status ({total} total)
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
            placeholder="Search by name or email..."
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "all" | "active" | "disabled");
              setPage(1);
            }}
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-tertiary border-b border-border text-xs uppercase font-mono tracking-wider text-text-muted">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Orgs</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <Spinner />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-bg-tertiary/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-accent/20 text-accent font-mono px-1.5 py-0.2 rounded">
                              you
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-muted font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_super_admin ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                            Super Admin
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.status === "active"
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {u.org_count}
                      </td>
                      <td className="py-3 px-4 text-xs text-text-muted font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Super admin toggle */}
                          <button
                            onClick={() => handleToggleSuperAdmin(u)}
                            disabled={isActionLoading}
                            className={`text-xs px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
                              u.is_super_admin
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30"
                            } disabled:opacity-50`}
                          >
                            {isActionLoading
                              ? "..."
                              : u.is_super_admin
                              ? "Demote"
                              : "Promote"}
                          </button>

                          {/* Status toggle */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isActionLoading}
                            className={`text-xs px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
                              u.status === "active"
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                            } disabled:opacity-50`}
                          >
                            {isActionLoading
                              ? "..."
                              : u.status === "active"
                              ? "Disable"
                              : "Enable"}
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
    </div>
  );
}
