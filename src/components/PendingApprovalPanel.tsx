import { useState, useEffect, useCallback } from "react";
import { issues as issuesApi } from "../api";
import type { Issue } from "../types";
import toast from "react-hot-toast";
import { formatDate, TYPE_LABELS } from "../utils";
import RejectReasonDialog from "./RejectReasonDialog";
import PendingIssueDetailsModal from "./PendingIssueDetailsModal";

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

interface PendingIssueCardProps {
  issue: Issue;
  onOpenDetails: (issue: Issue) => void;
  onApprove: (id: number) => void;
  onOpenReject: (issue: Issue) => void;
  processing: boolean;
}

function PendingIssueCard({
  issue,
  onOpenDetails,
  onApprove,
  onOpenReject,
  processing,
}: PendingIssueCardProps) {
  const attachmentCount = issue.attachments?.length || 0;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-focus/30 transition shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          {issue.app_name && (
            <div className="font-bold text-text-primary text-base mb-1">{issue.app_name}</div>
          )}
          <h3
            onClick={() => onOpenDetails(issue)}
            className="text-sm font-semibold text-text-primary hover:text-accent cursor-pointer transition"
          >
            {issue.title}
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-text-muted bg-bg-primary px-2 py-0.5 rounded border border-border shrink-0">
          #{issue.id}
        </span>
      </div>

      <p
        onClick={() => onOpenDetails(issue)}
        className="text-xs text-text-muted mb-3 line-clamp-2 cursor-pointer hover:text-text-secondary transition"
      >
        {issue.description}
      </p>

      <div className="flex items-center gap-2 flex-wrap mb-3.5">
        <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
        <Badge color="bg-blue-500/15 text-blue-400">Client Ticket</Badge>
        {attachmentCount > 0 && (
          <span className="text-xs font-medium rounded-md px-2 py-0.5 bg-accent/15 text-accent border border-accent/25 flex items-center gap-1">
            <span>📎</span>
            <span>{attachmentCount} {attachmentCount === 1 ? "file" : "files"}</span>
          </span>
        )}
        <span className="text-xs text-text-muted">
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.created_at)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails(issue)}
          className="h-9 w-full bg-bg-tertiary hover:bg-bg-primary text-text-primary font-medium text-sm rounded-md border border-border transition cursor-pointer flex items-center justify-center shadow-sm"
        >
          View Details
        </button>
        <button
          onClick={() => onApprove(issue.id)}
          disabled={processing}
          className="h-9 w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-md border border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-sm"
        >
          {processing ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={() => onOpenReject(issue)}
          disabled={processing}
          className="h-9 w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-md border border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-sm"
        >
          Reject...
        </button>
      </div>
    </div>
  );
}

interface Props {
  orgId: number;
  onCountChange?: (count: number) => void;
}

export default function PendingApprovalPanel({ orgId, onCountChange }: Props) {
  const [pendingIssues, setPendingIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // View details modal state
  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null);

  // Reject dialog state
  const [rejectingIssue, setRejectingIssue] = useState<Issue | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const data = await issuesApi.pending(orgId);
      setPendingIssues(data || []);
      if (onCountChange) onCountChange(data?.length || 0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load pending issues");
    } finally {
      setLoading(false);
    }
  }, [orgId, onCountChange]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleApprove(id: number) {
    setProcessingId(id);
    try {
      await issuesApi.approve(orgId, id, { action: "approved" });
      toast.success("Issue approved");
      const updated = pendingIssues.filter((i) => i.id !== id);
      setPendingIssues(updated);
      if (onCountChange) onCountChange(updated.length);
      if (detailsIssue?.id === id) {
        setDetailsIssue(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve issue");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleConfirmReject(reason: string) {
    if (!rejectingIssue) return;

    setRejectSubmitting(true);
    try {
      await issuesApi.approve(orgId, rejectingIssue.id, {
        action: "rejected",
        reason,
      });
      toast.success("Issue rejected with reason");
      const updated = pendingIssues.filter((i) => i.id !== rejectingIssue.id);
      setPendingIssues(updated);
      if (onCountChange) onCountChange(updated.length);
      if (detailsIssue?.id === rejectingIssue.id) {
        setDetailsIssue(null);
      }
      setRejectingIssue(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject issue");
    } finally {
      setRejectSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (pendingIssues.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-secondary border border-border rounded-lg">
        <p className="text-text-muted text-sm">No pending approvals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingIssues.map((issue) => (
        <PendingIssueCard
          key={issue.id}
          issue={issue}
          onOpenDetails={(target) => setDetailsIssue(target)}
          onApprove={handleApprove}
          onOpenReject={(target) => setRejectingIssue(target)}
          processing={processingId === issue.id}
        />
      ))}

      {/* View Details Modal with Attachments */}
      <PendingIssueDetailsModal
        open={!!detailsIssue}
        issue={detailsIssue}
        onClose={() => setDetailsIssue(null)}
        onApprove={handleApprove}
        onOpenReject={(target) => setRejectingIssue(target)}
        processing={processingId === detailsIssue?.id}
      />

      {/* Reject Reason Dialog */}
      <RejectReasonDialog
        open={!!rejectingIssue}
        issue={rejectingIssue}
        submitting={rejectSubmitting}
        onClose={() => setRejectingIssue(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
