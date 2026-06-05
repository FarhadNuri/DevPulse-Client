import { useState, useEffect, useCallback } from "react";
import { issues as issuesApi } from "../api";
import { useAuth } from "../hooks";
import type { Issue, IssueType, IssueStatus } from "../types";
import toast from "react-hot-toast";
import Header from "../components/Header";
import IssueCard from "../components/IssueCard";
import Spinner from "../components/Spinner";
import NewIssueModal from "../components/NewIssueModal";
import EditIssueModal from "../components/EditIssueModal";
import KanbanBoard from "../components/KanbanBoard";
import { normalizeStatus } from "../utils";

type ViewMode = "list" | "board";

export default function IssuesPage() {
  const { isLoggedIn, user } = useAuth();
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | IssueType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | IssueStatus>("all");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
    fetchIssues();
  }, [fetchIssues]);

  async function handleDelete(id: string) {
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
    `px-3 py-1.5 text-sm font-medium rounded-md transition ${
      active
        ? "bg-accent text-white"
        : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className={viewMode === "board" ? "max-w-7xl mx-auto px-4 py-6" : "max-w-4xl mx-auto px-4 py-6"}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={viewToggleCls(viewMode === "list")}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={viewToggleCls(viewMode === "board")}
            >
              Board View
            </button>
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
                className="bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md px-4 py-2 transition"
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
                key={issue._id}
                issue={issue}
                canEdit={isLoggedIn}
                canDelete={isLoggedIn && user?.role === "maintainer"}
                onEdit={setEditIssue}
                onDelete={handleDelete}
              />
            ))}
          </div>
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
    </div>
  );
}
