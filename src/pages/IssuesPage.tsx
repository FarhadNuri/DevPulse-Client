import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { issues as issuesApi } from "../api";
import { useAuth } from "../hooks";
import type { Issue, IssueType, IssueStatus } from "../types";
import toast from "react-hot-toast";
import Header from "../components/Header";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import NewIssueModal from "../components/NewIssueModal";
import EditIssueModal from "../components/EditIssueModal";
import IssueDetailsModal from "../components/IssueDetailsModal";
import KanbanBoard from "../components/KanbanBoard";
import ClientDashboard from "../components/ClientDashboard";
import PendingApprovalPanel from "../components/PendingApprovalPanel";
import { normalizeStatus } from "../utils";

type ViewMode = "list" | "board";
type TabMode = "all" | "pending";

export default function IssuesPage() {
  const { isLoggedIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | IssueType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | IssueStatus>("all");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [activeTab, setActiveTab] = useState<TabMode>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const isMaintainer = user?.role === "maintainer";
  const isClient = user?.role === "client";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  // Detect mobile device and force list view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("list");
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      const data = await issuesApi.list();
      setIssueList(data);
    } catch {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "all" && !isClient) {
      fetchIssues();
    }
  }, [fetchIssues, activeTab, isClient]);

  // If client, render ClientDashboard instead
  if (isClient) {
    return <ClientDashboard />;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this issue?")) return;
    try {
      await issuesApi.remove(id);
      toast.success("Issue deleted");
      await fetchIssues();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filtered = issueList.filter((i) => {
    if (filterType !== "all" && i.type !== filterType) return false;
    if (filterStatus !== "all" && normalizeStatus(i.status) !== filterStatus) return false;
    return true;
  });

  const selectCls =
    "bg-bg-primary border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-border-focus transition appearance-none cursor-pointer";

  const viewToggleCls = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition cursor-pointer ${
      active
        ? "bg-accent text-white"
        : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
    }`;

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition cursor-pointer ${
      active
        ? "border-accent text-text-primary"
        : "border-transparent text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isMaintainer && (
          <div className="flex items-center gap-1 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab("all")}
              className={tabCls(activeTab === "all")}
            >
              All Issues
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={tabCls(activeTab === "pending")}
            >
              Pending Approval
              {pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] inline-block text-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        )}

        {activeTab === "pending" ? (
          <PendingApprovalPanel onCountChange={setPendingCount} />
        ) : (
          <>
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
              <div className="flex items-center gap-2">
                {viewMode === "list" && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | IssueStatus)}
                    className={selectCls}
                  >
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                )}
                {viewMode === "board" ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFilterType("all")}
                      className={filterType === "all" ? viewToggleCls(true) : viewToggleCls(false)}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType("bug")}
                      className={filterType === "bug" ? viewToggleCls(true) : viewToggleCls(false)}
                    >
                      Bugs
                    </button>
                    <button
                      onClick={() => setFilterType("feature_request")}
                      className={filterType === "feature_request" ? viewToggleCls(true) : viewToggleCls(false)}
                    >
                      Feature Requests
                    </button>
                  </div>
                ) : (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as "all" | IssueType)}
                    className={selectCls}
                  >
                    <option value="all">All types</option>
                    <option value="bug">Bug</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => setNewModalOpen(true)}
                    className="bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md px-4 py-2 transition cursor-pointer"
                  >
                    New Issue
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : viewMode === "board" ? (
              <KanbanBoard
                issues={issueList}
                canEdit={isLoggedIn}
                canDelete={isLoggedIn && user?.role === "maintainer"}
                onEdit={setEditIssue}
                onDelete={handleDelete}
                onRefetch={fetchIssues}
                typeFilter={filterType}
                onViewDetails={setDetailsIssue}
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted text-sm">No issues found.</p>
                {isLoggedIn && (
                  <button
                    onClick={() => setNewModalOpen(true)}
                    className="text-accent hover:text-accent-hover text-sm mt-2 transition"
                  >
                    Create one!
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    canEdit={isLoggedIn}
                    canDelete={isLoggedIn && user?.role === "maintainer"}
                    onEdit={setEditIssue}
                    onDelete={handleDelete}
                    isLoggedIn={isLoggedIn}
                    currentUser={user}
                    onViewDetails={setDetailsIssue}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <NewIssueModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onCreated={fetchIssues}
      />
      <EditIssueModal
        open={!!editIssue}
        onClose={() => setEditIssue(null)}
        issue={editIssue}
        onUpdated={fetchIssues}
      />
      <IssueDetailsModal
        open={!!detailsIssue}
        onClose={() => setDetailsIssue(null)}
        issue={detailsIssue}
        isLoggedIn={isLoggedIn}
        currentUser={user}
      />
    </div>
  );
}
