import { useState, useEffect, useCallback } from "react";
import { issues as issuesApi } from "../api";
import type { Issue } from "../types";
import toast from "react-hot-toast";
import { formatDate, TYPE_LABELS } from "../utils";

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
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processing: boolean;
}

function PendingIssueCard({ issue, onApprove, onReject, processing }: PendingIssueCardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-focus/30 transition">
      {issue.app_name && (
        <div className="font-bold text-text-primary text-base mb-2">{issue.app_name}</div>
      )}
      <h3 className="text-sm font-semibold text-text-primary mb-1">{issue.title}</h3>
      <p className="text-xs text-text-muted mb-3 line-clamp-2">{issue.description}</p>
      
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
        <Badge color="bg-blue-500/15 text-blue-400">Client</Badge>
        <span className="text-xs text-text-muted">
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.created_at)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(issue.id)}
          disabled={processing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-md px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={() => onReject(issue.id)}
          disabled={processing}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-md px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  onCountChange: (count: number) => void;
}

export default function PendingApprovalPanel({ onCountChange }: Props) {
  const [pendingIssues, setPendingIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const data = await issuesApi.pending();
      setPendingIssues(data);
      onCountChange(data.length);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load pending issues");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleApprove(id: number) {
    setProcessingId(id);
    try {
      await issuesApi.approve(id, { action: "approved" });
      toast.success("Issue approved");
      setPendingIssues((prev) => prev.filter((i) => i.id !== id));
      onCountChange(pendingIssues.length - 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve issue");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: number) {
    setProcessingId(id);
    try {
      await issuesApi.approve(id, { action: "rejected" });
      toast.success("Issue rejected");
      setPendingIssues((prev) => prev.filter((i) => i.id !== id));
      onCountChange(pendingIssues.length - 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject issue");
    } finally {
      setProcessingId(null);
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
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processingId === issue.id}
        />
      ))}
    </div>
  );
}
