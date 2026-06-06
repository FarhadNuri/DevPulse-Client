import { useEffect } from "react";
import type { Issue } from "../types";
import { formatDate, STATUS_LABELS, TYPE_LABELS } from "../utils";
import CommentSection from "./CommentSection";

interface IssueDetailsModalProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string; role: string } | null;
}

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
  pending: "bg-amber-500/15 text-amber-500",
  approved: "bg-green-500/15 text-green-500",
  rejected: "bg-red-500/15 text-red-500",
};

const approvalLabels: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const roleColors: Record<string, string> = {
  maintainer: "bg-indigo-500/15 text-indigo-400",
  contributor: "bg-blue-500/15 text-blue-400",
  client: "bg-amber-500/15 text-amber-400",
};

export default function IssueDetailsModal({ 
  open, 
  onClose, 
  issue, 
  isLoggedIn, 
  currentUser 
}: IssueDetailsModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-bg-secondary border-b border-border px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-primary mb-2">{issue.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color={typeColors[issue.type]}>
                {TYPE_LABELS[issue.type] ?? issue.type}
              </Badge>
              <Badge color={statusColors[issue.status]}>
                {STATUS_LABELS[issue.status] ?? issue.status}
              </Badge>
              {issue.approval_status && (
                <Badge color={approvalColors[issue.approval_status]}>
                  {approvalLabels[issue.approval_status] ?? issue.approval_status}
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-text-muted hover:text-text-primary transition text-2xl leading-none shrink-0"
            title="Close"
          >
            ×
          </button>
        </div>


        <div className="px-6 py-4 space-y-6">
          {issue.app_name && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Application
              </h3>
              <p className="text-sm text-text-primary font-medium">{issue.app_name}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
              {issue.description}
            </p>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-bg-primary rounded-lg border border-border">
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Reported By
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary font-medium">
                  {issue.reporter?.name ?? "Unknown"}
                </span>
                {issue.reporter?.role && (
                  <Badge color={roleColors[issue.reporter.role]}>
                    {issue.reporter.role}
                  </Badge>
                )}
              </div>
            </div>


            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Created
              </h4>
              <p className="text-sm text-text-primary">{formatDate(issue.created_at)}</p>
            </div>


            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Last Updated
              </h4>
              <p className="text-sm text-text-primary">{formatDate(issue.updated_at)}</p>
            </div>


            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Issue ID
              </h4>
              <p className="text-sm text-text-primary font-mono">#{issue.id}</p>
            </div>
          </div>


          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Comments</h3>
            <CommentSection
              issueId={issue.id}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              alwaysExpanded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
