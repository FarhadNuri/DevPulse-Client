import type { Issue } from "../types";
import type { ReactNode } from "react";
import { formatDate, STATUS_LABELS, TYPE_LABELS } from "../utils";
import CommentSection from "./CommentSection";

function Badge({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className={`text-xs font-medium rounded-md px-2 py-0.5 ${color}`}
    >
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
  pending: "bg-amber-500/15 text-amber-500",
  approved: "bg-green-500/15 text-green-500",
  rejected: "bg-red-500/15 text-red-500",
};

const approvalLabels: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

interface IssueCardProps {
  issue: Issue;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string; role: string } | null;
  onViewDetails: (issue: Issue) => void;
}

export default function IssueCard({ issue, canEdit, canDelete, onEdit, onDelete, isLoggedIn, currentUser, onViewDetails }: IssueCardProps) {
  return (
    <div 
      className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-focus/30 transition cursor-pointer"
      onClick={() => onViewDetails(issue)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-primary truncate">{issue.title}</h3>
          <p className="text-sm text-text-muted mt-1 line-clamp-2">{issue.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(issue);
              }}
              className="text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-3 py-1.5 rounded-md border border-accent/30 cursor-pointer"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(issue.id);
              }}
              className="text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition px-3 py-1.5 rounded-md border border-red-500/30 cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
        <Badge color={statusColors[issue.status]}>{STATUS_LABELS[issue.status] ?? issue.status}</Badge>
        {issue.approval_status && (
          <Badge color={approvalColors[issue.approval_status]}>
            {approvalLabels[issue.approval_status] ?? issue.approval_status}
          </Badge>
        )}
        <span className="text-sm text-text-muted ml-auto">
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.created_at)}
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
