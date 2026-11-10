import type { Issue } from "../types";
import type { ReactNode } from "react";
import { formatDate, STATUS_LABELS, TYPE_LABELS } from "../utils";

function Badge({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className={`text-[11px] font-semibold rounded-md px-2 py-0.5 ${color}`}>
      {children}
    </span>
  );
}

const typeColors: Record<string, string> = {
  bug: "bg-red-500/15 text-red-400 border border-red-500/30",
  feature_request: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  resolved: "bg-green-500/15 text-green-400 border border-green-500/30",
};

const approvalColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  approved: "bg-green-500/15 text-green-500 border border-green-500/30",
  rejected: "bg-red-500/15 text-red-500 border border-red-500/30",
};

const approvalLabels: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface IssueCardProps {
  orgId: number;
  issue: Issue;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (issue: Issue) => void;
  onDelete?: (id: number) => void;
  isLoggedIn?: boolean;
  currentUser?: { id: number; name: string } | null;
  onViewDetails: (issue: Issue) => void;
}

export default function IssueCard({
  issue,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onViewDetails,
}: IssueCardProps) {
  return (
    <div
      onClick={() => onViewDetails(issue)}
      className="bg-bg-secondary border border-border rounded-lg p-3.5 hover:border-border-focus/60 transition cursor-pointer space-y-2.5 group hover:shadow-md"
    >
      {/* Top row: Title and action buttons */}
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition leading-snug line-clamp-2">
          {issue.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(issue)}
              className="text-xs font-medium text-text-muted hover:text-accent p-1 transition cursor-pointer"
              title="Quick Edit"
            >
              ✏️
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(issue.id)}
              className="text-xs font-medium text-text-muted hover:text-red-400 p-1 transition cursor-pointer"
              title="Delete Issue"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Description preview */}
      {issue.description && (
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {issue.description}
        </p>
      )}

      {/* Label chips row */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {issue.labels.map((lbl) => (
            <span
              key={lbl.id}
              style={{
                backgroundColor: `${lbl.color}20`,
                color: lbl.color,
                borderColor: `${lbl.color}40`,
              }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate max-w-[120px]"
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer metadata: Badges, Assignee avatar/initials, Comments */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-semibold text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded border border-border">
            #{issue.id}
          </span>
          <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
          <Badge color={statusColors[issue.status]}>{STATUS_LABELS[issue.status] ?? issue.status}</Badge>
          {issue.approval_status && (
            <Badge color={approvalColors[issue.approval_status]}>
              {approvalLabels[issue.approval_status] ?? issue.approval_status}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-text-muted">
          {/* Comment Count */}
          {(Number(issue.comment_count) > 0 || issue.comment_count === 0) && (
            <span className="flex items-center gap-1 text-[11px] hover:text-text-primary transition">
              <span>💬</span>
              <span>{issue.comment_count || 0}</span>
            </span>
          )}

          <span>{formatDate(issue.created_at)}</span>

          {/* Assignee Avatar / Initials */}
          {issue.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold text-[10px] flex items-center justify-center border border-accent/40"
              title={`Assigned to ${issue.assignee.name}`}
            >
              {getInitials(issue.assignee.name)}
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full border border-dashed border-border/60 text-text-muted text-[10px] flex items-center justify-center"
              title="Unassigned"
            >
              👤
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
