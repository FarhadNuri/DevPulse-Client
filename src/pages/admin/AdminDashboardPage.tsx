import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api";
import type {
  AdminStats,
  AdminProject,
  AdminIssue,
  AdminUser,
  AdminOrg,
} from "../../types";
import Spinner from "../../components/Spinner";

type ModalType =
  | "projects"
  | "issues"
  | "pending"
  | "signups"
  | "active_orgs";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Detail Modal State
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  // Modal data caches
  const [projectsList, setProjectsList] = useState<AdminProject[]>([]);
  const [issuesList, setIssuesList] = useState<AdminIssue[]>([]);
  const [pendingList, setPendingList] = useState<AdminIssue[]>([]);
  const [signupsList, setSignupsList] = useState<AdminUser[]>([]);
  const [activeOrgsList, setActiveOrgsList] = useState<AdminOrg[]>([]);

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => {
        setStats(res);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch data for the active modal
  const fetchModalData = useCallback(async (type: ModalType, search = "") => {
    if (!type) return;
    setModalLoading(true);
    try {
      if (type === "projects") {
        const res = await adminApi.listProjects({ search: search.trim() || undefined, limit: 100 });
        setProjectsList(res.items || []);
      } else if (type === "issues") {
        const res = await adminApi.listIssues({ search: search.trim() || undefined, limit: 100 });
        setIssuesList(res.items || []);
      } else if (type === "pending") {
        const res = await adminApi.listIssues({
          approval_status: "pending",
          search: search.trim() || undefined,
          limit: 100,
        });
        setPendingList(res.items || []);
      } else if (type === "signups") {
        const res = await adminApi.listUsers({
          recent_days: 7,
          search: search.trim() || undefined,
          limit: 100,
        });
        setSignupsList(res.items || []);
      } else if (type === "active_orgs") {
        const res = await adminApi.listOrgs({
          active_recent_days: 7,
          search: search.trim() || undefined,
          limit: 100,
        });
        setActiveOrgsList(res.items || []);
      }
    } catch (err) {
      console.error("Failed to load details for " + type, err);
    } finally {
      setModalLoading(false);
    }
  }, []);

  function handleOpenModal(type?: ModalType) {
    if (!type) return;
    setActiveModal(type);
    setModalSearch("");
    fetchModalData(type, "");
  }

  function handleCloseModal() {
    setActiveModal(null);
    setModalSearch("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        <h3 className="font-semibold text-lg mb-1">Error Loading Dashboard</h3>
        <p className="text-sm">{error || "Unable to retrieve platform statistics"}</p>
      </div>
    );
  }

  const statCards = [
    {
      id: "users",
      label: "Total Users",
      value: stats.users,
      icon: "",
      link: "/admin/users",
      subtext: `${stats.signups_last_7_days} signed up last 7 days`,
      color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60",
      actionText: "Manage Users →",
    },
    {
      id: "orgs",
      label: "Organizations",
      value: stats.organizations,
      icon: "",
      link: "/admin/orgs",
      subtext: `${stats.active_orgs_last_7_days} active in last 7 days`,
      color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60",
      actionText: "Manage Organizations →",
    },
    {
      id: "projects",
      label: "Total Projects",
      value: stats.projects,
      icon: "",
      modal: "projects" as ModalType,
      subtext: "Across all organizations",
      color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60",
      actionText: "View All Projects →",
    },
    {
      id: "issues",
      label: "Total Issues",
      value: stats.issues,
      icon: "",
      modal: "issues" as ModalType,
      subtext: "Tracked across all projects",
      color: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60",
      actionText: "View All Issues →",
    },
    {
      id: "pending",
      label: "Pending Issues",
      value: stats.pending_issues,
      icon: "",
      modal: "pending" as ModalType,
      subtext: "Awaiting triage / approval",
      color: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60",
      actionText: "Review Pending Issues →",
    },
    {
      id: "signups",
      label: "Signups (7d)",
      value: stats.signups_last_7_days,
      icon: "",
      modal: "signups" as ModalType,
      subtext: "New accounts in past week",
      color: "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/60",
      actionText: "View Recent Signups →",
    },
    {
      id: "active_orgs",
      label: "Active Orgs (7d)",
      value: stats.active_orgs_last_7_days,
      icon: "",
      modal: "active_orgs" as ModalType,
      subtext: "Had activity in past week",
      color: "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/60",
      actionText: "View Active Orgs →",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Platform Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time platform metrics, tenant activity, and system status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Content = (
            <div
              className={`p-5 rounded-xl border ${card.color} transition cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md h-full`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
                    {card.label}
                  </span>
                  <span className="text-xl group-hover:scale-110 transition transform">
                    {card.icon}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-text-primary">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-xs text-text-muted mt-1.5">{card.subtext}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-accent font-medium group-hover:translate-x-0.5 transition transform">
                <span>{card.actionText}</span>
              </div>
            </div>
          );

          if (card.link) {
            return (
              <Link key={i} to={card.link} className="block transition transform hover:-translate-y-0.5">
                {Content}
              </Link>
            );
          }

          return (
            <div
              key={i}
              onClick={() => handleOpenModal(card.modal)}
              className="block transition transform hover:-translate-y-0.5"
            >
              {Content}
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between shrink-0 bg-bg-secondary">
              <div>
                <h3 className="text-lg font-bold text-text-primary capitalize flex items-center gap-2">
                  <span>
                    {activeModal === "projects" && "📁 Platform Projects"}
                    {activeModal === "issues" && "🎫 Platform Issues"}
                    {activeModal === "pending" && "⏳ Pending Client Tickets"}
                    {activeModal === "signups" && "📈 Recent User Signups (Last 7 Days)"}
                    {activeModal === "active_orgs" && "⚡ Active Organizations (Last 7 Days)"}
                  </span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Detailed inspection view for platform administrators
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg bg-bg-tertiary hover:bg-bg-primary text-text-muted hover:text-text-primary flex items-center justify-center text-sm border border-border transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Filter / Search bar */}
            <div className="p-4 border-b border-border/80 bg-bg-tertiary/30 shrink-0">
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => {
                  setModalSearch(e.target.value);
                  fetchModalData(activeModal, e.target.value);
                }}
                placeholder="Search by title, name, or organization..."
                className="w-full px-3.5 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-5 overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="py-16 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Projects View */}
                  {activeModal === "projects" && (
                    <div className="space-y-3">
                      {projectsList.length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-sm">
                          No projects found matching your search.
                        </div>
                      ) : (
                        projectsList.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 bg-bg-primary border border-border/80 hover:border-accent/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-text-primary text-sm">
                                  {p.name}
                                </span>
                                <span className="text-xs text-text-muted font-mono bg-bg-secondary px-2 py-0.5 rounded border border-border">
                                  {p.org_name} ({p.org_slug})
                                </span>
                              </div>
                              {p.description && (
                                <p className="text-xs text-text-muted mt-1 line-clamp-1">
                                  {p.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                                <span className="text-amber-400 font-medium">{p.open_count || 0} Open</span>
                                <span>•</span>
                                <span className="text-purple-400 font-medium">{p.in_progress_count || 0} In Progress</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">{p.resolved_count || 0} Resolved</span>
                                <span>•</span>
                                <span>{p.member_count || 0} members</span>
                              </div>
                            </div>

                            <Link
                              to={`/orgs/${p.org_id}/projects/${p.id}`}
                              onClick={handleCloseModal}
                              className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-medium transition flex items-center gap-1 shrink-0"
                            >
                              <span>Open Board</span>
                              <span>→</span>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Issues / Pending View */}
                  {(activeModal === "issues" || activeModal === "pending") && (
                    <div className="space-y-3">
                      {(activeModal === "pending" ? pendingList : issuesList).length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-sm">
                          No issues found.
                        </div>
                      ) : (
                        (activeModal === "pending" ? pendingList : issuesList).map((issue) => (
                          <div
                            key={issue.id}
                            className="p-4 bg-bg-primary border border-border/80 hover:border-accent/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-semibold text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded border border-border">
                                  #{issue.id}
                                </span>
                                <span className="font-semibold text-text-primary text-sm">
                                  {issue.title}
                                </span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                    issue.type === "bug"
                                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                      : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                  }`}
                                >
                                  {issue.type === "bug" ? "Bug" : "Feature Request"}
                                </span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                    issue.approval_status === "approved"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : issue.approval_status === "pending"
                                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                      : "bg-red-500/15 text-red-400"
                                  }`}
                                >
                                  {issue.approval_status}
                                </span>
                              </div>

                              <p className="text-xs text-text-muted line-clamp-2">
                                {issue.description}
                              </p>

                              <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                                <span>Org: <span className="text-text-secondary font-medium">{issue.org_name}</span></span>
                                <span>•</span>
                                <span>Project: <span className="text-text-secondary font-medium">{issue.project_name}</span></span>
                                <span>•</span>
                                <span>Reporter: <span className="text-text-secondary font-medium">{issue.reporter?.name || "Unknown"}</span></span>
                                <span>•</span>
                                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <Link
                              to={`/orgs/${issue.org_id}/projects/${issue.project_id}`}
                              onClick={handleCloseModal}
                              className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-secondary text-text-primary border border-border font-medium transition flex items-center gap-1 shrink-0"
                            >
                              <span>View in Project</span>
                              <span>→</span>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Recent Signups View */}
                  {activeModal === "signups" && (
                    <div className="space-y-3">
                      {signupsList.length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-sm">
                          No new signups in the past 7 days.
                        </div>
                      ) : (
                        signupsList.map((u) => (
                          <div
                            key={u.id}
                            className="p-4 bg-bg-primary border border-border/80 hover:border-accent/40 rounded-xl transition flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-text-primary text-sm">
                                  {u.name}
                                </span>
                                {u.is_super_admin && (
                                  <span className="text-[10px] font-mono uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted font-mono mt-0.5">
                                {u.email}
                              </div>
                              <div className="text-[11px] text-text-muted mt-1.5">
                                Joined on {new Date(u.created_at).toLocaleString()} • Member of {u.org_count || 0} organizations
                              </div>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                u.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/15 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {u.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Active Orgs View */}
                  {activeModal === "active_orgs" && (
                    <div className="space-y-3">
                      {activeOrgsList.length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-sm">
                          No active organizations recorded.
                        </div>
                      ) : (
                        activeOrgsList.map((org) => (
                          <div
                            key={org.id}
                            className="p-4 bg-bg-primary border border-border/80 hover:border-accent/40 rounded-xl transition flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-text-primary text-sm">
                                  {org.name}
                                </span>
                                <span className="text-xs font-mono text-text-muted">
                                  ({org.slug})
                                </span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                    org.status === "active"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {org.status}
                                </span>
                              </div>
                              <div className="text-xs text-text-muted mt-1">
                                Owner: <span className="text-text-secondary font-medium">{org.owner.name}</span> ({org.owner.email})
                              </div>
                              <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
                                <span>{org.member_count} members</span>
                                <span>•</span>
                                <span>{org.project_count} projects</span>
                                <span>•</span>
                                <span>{org.issue_count} issues</span>
                              </div>
                            </div>

                            <Link
                              to={`/orgs/${org.id}/projects`}
                              onClick={handleCloseModal}
                              className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 font-medium transition flex items-center gap-1 shrink-0"
                            >
                              <span>Inspect Org</span>
                              <span>→</span>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted bg-bg-secondary shrink-0">
              <span>Press ESC or click close to dismiss</span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-primary text-text-primary font-medium border border-border transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
