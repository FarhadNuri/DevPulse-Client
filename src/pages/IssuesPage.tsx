import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { issues as issuesApi, projects as projectsApi, getProjectActivity } from "../api";
import { useAuth, useOrg, useConfirm } from "../hooks";
import type { Issue, Project } from "../types";
import toast from "react-hot-toast";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import NewIssueModal from "../components/NewIssueModal";
import EditIssueModal from "../components/EditIssueModal";
import KanbanBoard from "../components/KanbanBoard";
import PendingApprovalPanel from "../components/PendingApprovalPanel";
import AccessRequestsPanel from "../components/AccessRequestsPanel";
import ProjectMembersPanel from "../components/ProjectMembersPanel";
import IssueFilters from "../components/IssueFilters";
import IssueDrawer from "../components/IssueDrawer";
import ActivityTimeline from "../components/ActivityTimeline";

type ViewMode = "board" | "list";
type TabMode = "all" | "pending" | "access_requests" | "members" | "activity";

export default function IssuesPage() {
  const { isLoggedIn, user, isLoading } = useAuth();
  const { isMaintainer, isGuest } = useOrg();
  const confirm = useConfirm();

  const { orgId, projectId: paramProjectId } = useParams<{
    orgId: string;
    projectId: string;
  }>();
  const numOrgId = Number(orgId);
  const numProjectId = Number(paramProjectId);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params as primitive values to prevent unnecessary re-fetches
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;
  const assignee = searchParams.get("assignee") || undefined;
  const labelsStr = searchParams.getAll("label").sort().join(",");
  const page = Number(searchParams.get("page")) || 1;
  const limit = 30;

  const labels = useMemo(() => {
    return labelsStr ? labelsStr.split(",") : [];
  }, [labelsStr]);

  const [project, setProject] = useState<Project | null>(null);
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [activeTab, setActiveTab] = useState<TabMode>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  // Check access to project
  useEffect(() => {
    if (isNaN(numOrgId) || isNaN(numProjectId)) {
      setAllowed(false);
      return;
    }

    projectsApi
      .get(numOrgId, numProjectId)
      .then((p) => {
        setProject(p);
        setAllowed(true);
      })
      .catch(() => {
        setAllowed(false);
      });
  }, [numOrgId, numProjectId]);

  // Mobile check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setViewMode("list");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchIssues = useCallback(async () => {
    if (isNaN(numOrgId) || isNaN(numProjectId)) return;
    try {
      setLoading(true);
      const data = await issuesApi.list(numOrgId, numProjectId, {
        search,
        status,
        type,
        assignee,
        label: labels.length > 0 ? labels : undefined,
        page,
        limit,
      });
      setIssueList(data.items || []);
      setTotalIssues(data.total || 0);
    } catch {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [numOrgId, numProjectId, search, status, type, assignee, labelsStr, page]);

  useEffect(() => {
    if (allowed && activeTab === "all") {
      fetchIssues();
    }
  }, [allowed, activeTab, fetchIssues]);

  if (isLoading || allowed === null) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-bg-secondary border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-muted text-sm mb-6">
            You do not have approved access to view this project's board.
          </p>
          <Link
            to={`/orgs/${numOrgId}/projects`}
            className="inline-block bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: "Delete Issue",
      message: "Are you sure you want to delete this issue? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await issuesApi.remove(numOrgId, id);
      toast.success("Issue deleted");
      await fetchIssues();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function handleOpenDetails(issue: Issue) {
    const next = new URLSearchParams(searchParams);
    next.set("issue", String(issue.id));
    setSearchParams(next);
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  }

  const totalPages = Math.ceil(totalIssues / limit) || 1;

  const viewToggleCls = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
      active
        ? "bg-accent text-white shadow-xs"
        : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
    }`;

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition cursor-pointer ${
      active
        ? "border-accent text-text-primary font-semibold"
        : "border-transparent text-text-muted hover:text-text-secondary"
    }`;

  return (
    <div className="p-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb & Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <Link to={`/orgs/${numOrgId}/projects`} className="hover:text-accent transition">
              Projects
            </Link>
            <span>/</span>
            <span className="text-text-secondary truncate">{project?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{project?.name}</h1>
          {project?.description && (
            <p className="text-xs text-text-muted mt-0.5">{project.description}</p>
          )}
        </div>

        {isLoggedIn && (
          <button
            onClick={() => setNewModalOpen(true)}
            className="bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md px-4 py-2 transition cursor-pointer self-start sm:self-auto shadow-sm"
          >
            {isGuest ? "+ Submit Ticket" : "+ New Issue"}
          </button>
        )}
      </div>

      {/* Maintainer & Contributor Navigation Tabs */}
      {!isGuest && (
        <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={tabCls(activeTab === "all")}
          >
            Board
          </button>
          {isMaintainer && (
            <>
              <button
                onClick={() => setActiveTab("pending")}
                className={tabCls(activeTab === "pending")}
              >
                Pending Approval
                {pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-full px-1.5 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("access_requests")}
                className={tabCls(activeTab === "access_requests")}
              >
                Access Requests
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={tabCls(activeTab === "members")}
              >
                Members
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("activity")}
            className={tabCls(activeTab === "activity")}
          >
            Activity
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === "pending" ? (
        <PendingApprovalPanel orgId={numOrgId} onCountChange={setPendingCount} />
      ) : activeTab === "access_requests" ? (
        <AccessRequestsPanel orgId={numOrgId} projectId={numProjectId} />
      ) : activeTab === "members" ? (
        <ProjectMembersPanel
          orgId={numOrgId}
          projectId={numProjectId}
          projectName={project?.name}
        />
      ) : activeTab === "activity" ? (
        <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Project Activity</h2>
              <p className="text-xs text-text-muted mt-0.5">Timeline of all actions and changes in this project</p>
            </div>
          </div>
          <ActivityTimeline
            key={`activity-${numOrgId}-${numProjectId}`}
            fetchActivity={(before) => getProjectActivity(numOrgId, numProjectId, { before, limit: 10 })}
            emptyMessage="No activity recorded on this project yet."
          />
        </div>
      ) : (
        <>
          {/* Issue Filters (debounced search, status, type, assignee, labels) */}
          <IssueFilters
            orgId={numOrgId}
            projectId={numProjectId}
            currentUserId={user?.id}
          />

          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {!isMobile && (
                <>
                  <button
                    onClick={() => setViewMode("board")}
                    className={viewToggleCls(viewMode === "board")}
                  >
                    Board View
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={viewToggleCls(viewMode === "list")}
                  >
                    List View
                  </button>
                </>
              )}
            </div>

            <div className="text-xs text-text-muted">
              {totalIssues > 0 ? (
                <span>
                  Showing {issueList.length} of {totalIssues} issues
                </span>
              ) : null}
            </div>
          </div>

          {/* Board or List */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner />
            </div>
          ) : viewMode === "board" ? (
            <div className="space-y-4">
              <KanbanBoard
                orgId={numOrgId}
                issues={issueList}
                canEdit={isLoggedIn && !isGuest}
                canDelete={isLoggedIn && isMaintainer}
                onEdit={setEditIssue}
                onDelete={handleDelete}
                onRefetch={fetchIssues}
                typeFilter="all"
                onViewDetails={handleOpenDetails}
              />

              {/* Pagination controls for board */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
                  <span className="text-text-muted">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="px-3 py-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="px-3 py-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : issueList.length === 0 ? (
            <div className="text-center py-16 bg-bg-secondary border border-border rounded-xl">
              <p className="text-text-muted text-sm">No issues found matching the criteria.</p>
              {isLoggedIn && (
                <button
                  onClick={() => setNewModalOpen(true)}
                  className="text-accent hover:text-accent-hover text-sm mt-2 transition cursor-pointer font-medium"
                >
                  Create one!
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {issueList.map((issue) => (
                <IssueCard
                  key={issue.id}
                  orgId={numOrgId}
                  issue={issue}
                  canEdit={isLoggedIn && (!isGuest || issue.approval_status === "pending")}
                  canDelete={isLoggedIn && (isMaintainer || issue.reporter?.id === user?.id)}
                  onEdit={setEditIssue}
                  onDelete={handleDelete}
                  isLoggedIn={isLoggedIn}
                  currentUser={user}
                  onViewDetails={handleOpenDetails}
                />
              ))}

              {/* Pagination controls for list view */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
                  <span className="text-text-muted">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, totalIssues)} of {totalIssues}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="px-3 py-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                    >
                      ← Previous
                    </button>
                    <span className="text-text-muted px-1">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="px-3 py-1.5 rounded bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Slide-over Issue Drawer (?issue=ID) */}
      <IssueDrawer
        orgId={numOrgId}
        projectId={numProjectId}
        onIssueUpdated={fetchIssues}
      />

      {/* New Issue Modal */}
      <NewIssueModal
        open={newModalOpen}
        orgId={numOrgId}
        projectId={numProjectId}
        onClose={() => setNewModalOpen(false)}
        onCreated={fetchIssues}
      />

      {/* Edit Issue Modal (legacy quick modal) */}
      <EditIssueModal
        open={!!editIssue}
        orgId={numOrgId}
        onClose={() => setEditIssue(null)}
        issue={editIssue}
        onUpdated={fetchIssues}
      />
    </div>
  );
}
