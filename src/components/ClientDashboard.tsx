import { useState, useEffect, useCallback } from "react";
import { issues as issuesApi } from "../api";
import { useAuth } from "../hooks";
import type { Issue } from "../types";
import toast from "react-hot-toast";
import Header from "./Header";
import Spinner from "./Spinner";
import NewIssueModal from "./NewIssueModal";
import IssueDetailsModal from "./IssueDetailsModal";
import { formatDate, TYPE_LABELS } from "../utils";
import CommentSection from "./CommentSection";

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${color}`}>
      {children}
    </span>
  );
}

const typeColors: Record<string, string> = {
  bug: "bg-bug/15 text-bug",
  feature_request: "bg-feature/15 text-feature",
};

const statusColors: Record<string, string> = {
  open: "bg-open/15 text-open",
  in_progress: "bg-in-progress/15 text-in-progress",
  resolved: "bg-resolved/15 text-resolved",
};

const approvalColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

function ClientIssueCard({ 
  issue, 
  onDelete,
  isLoggedIn,
  currentUser,
  onViewDetails,
}: { 
  issue: Issue; 
  onDelete: (id: number) => void;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string; role: string } | null;
  onViewDetails: (issue: Issue) => void;
}) {
  const getApprovalIcon = () => {
    if (issue.approval_status === "pending") return "🕐";
    if (issue.approval_status === "approved") return "✓";
    if (issue.approval_status === "rejected") return "✕";
    return "";
  };

  const getApprovalLabel = () => {
    if (issue.approval_status === "pending") return "Pending Approval";
    if (issue.approval_status === "approved") return "Approved";
    if (issue.approval_status === "rejected") return "Rejected";
    return "";
  };

  return (
    <div 
      className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-focus/30 transition cursor-pointer"
      onClick={() => onViewDetails(issue)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {issue.app_name && (
            <div className="font-bold text-text-primary text-base mb-2">{issue.app_name}</div>
          )}
          <h3 className="text-base font-semibold text-text-primary mb-1">{issue.title}</h3>
          <p className="text-sm text-text-muted line-clamp-2">{issue.description}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(issue.id);
          }}
          className="text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition px-3 py-1.5 rounded-md border border-red-500/30 cursor-pointer shrink-0"
        >
          Delete
        </button>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
        
        {issue.approval_status && (
          <Badge color={approvalColors[issue.approval_status]}>
            {getApprovalIcon()} {getApprovalLabel()}
          </Badge>
        )}
        
        {issue.approval_status === "approved" && (
          <Badge color={statusColors[issue.status]}>
            {issue.status.replace(/_/g, " ")}
          </Badge>
        )}
        
        <span className="text-sm text-text-muted ml-auto">
          {formatDate(issue.created_at)}
        </span>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CommentSection
          issueId={issue.id}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      const data = await issuesApi.list();
      const clientIssues = data.filter(issue => issue.approval_status !== undefined);
      setIssueList(clientIssues);
    } catch {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this issue? This action cannot be undone.")) return;
    try {
      await issuesApi.remove(id);
      toast.success("Issue deleted");
      await fetchIssues();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete issue");
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">My Submissions</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">{user?.name}</span>
              <Badge color="bg-blue-500/15 text-blue-400">Client</Badge>
            </div>
          </div>
          <button
            onClick={() => setNewModalOpen(true)}
            className="bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md px-4 py-2 transition cursor-pointer"
          >
            Submit Issue
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : issueList.length === 0 ? (
          <div className="text-center py-16 bg-bg-secondary border border-border rounded-lg">
            <p className="text-text-muted text-sm mb-2">
              You haven't submitted any issues yet.
            </p>
            <button
              onClick={() => setNewModalOpen(true)}
              className="text-accent hover:text-accent-hover text-sm transition"
            >
              Click Submit Issue to get started.
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {issueList.map((issue) => (
              <ClientIssueCard 
                key={issue.id} 
                issue={issue} 
                onDelete={handleDelete}
                isLoggedIn={true}
                currentUser={user}
                onViewDetails={setDetailsIssue}
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
      <IssueDetailsModal
        open={!!detailsIssue}
        onClose={() => setDetailsIssue(null)}
        issue={detailsIssue}
        isLoggedIn={true}
        currentUser={user}
      />
    </div>
  );
}
