import type { Issue } from "../types";
import type { ReactNode } from "react";
import { formatDate, STATUS_LABELS, TYPE_LABELS } from "../utils";

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

interface IssueCardProps {
  issue: Issue;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
}

export default function IssueCard({ issue, canEdit, canDelete, onEdit, onDelete }: IssueCardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-focus/30 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">{issue.title}</h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">{issue.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {canEdit && (
            <button
              onClick={() => onEdit(issue)}
              className="text-xs text-text-muted hover:text-text-primary transition px-1.5 py-0.5 rounded hover:bg-bg-tertiary"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(issue.id)}
              className="text-xs text-text-muted hover:text-red-400 transition px-1.5 py-0.5 rounded hover:bg-bg-tertiary"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge color={typeColors[issue.type]}>{TYPE_LABELS[issue.type] ?? issue.type}</Badge>
        <Badge color={statusColors[issue.status]}>{STATUS_LABELS[issue.status] ?? issue.status}</Badge>
        <span className="text-xs text-text-muted ml-auto">
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.created_at)}
        </span>
      </div>
    </div>
  );
}
