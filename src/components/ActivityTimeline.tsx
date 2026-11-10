import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityEntry, PaginatedActivityResponse } from "../types";
import { formatRelativeTime, formatExactTime, denormalizeStatus } from "../utils";

interface ActivityTimelineProps {
  fetchActivity: (before?: number) => Promise<PaginatedActivityResponse>;
  currentIssueId?: number;
  emptyMessage?: string;
}

/**
 * Formats an activity entry into a human-readable sentence.
 */
export function formatActivityAction(entry: ActivityEntry, currentIssueId?: number): {
  actorName: string;
  actionText: string;
  details?: string | null;
} {
  const actorName = entry.actor?.name || "Someone";
  const issueRef = entry.issue_id
    ? currentIssueId && currentIssueId === entry.issue_id
      ? "this issue"
      : `#${entry.issue_id}`
    : "an issue";

  const meta = entry.metadata || {};

  switch (entry.action) {
    case "issue.status_changed": {
      const toStatus = meta.to ? denormalizeStatus(meta.to as any) : "a new status";
      return {
        actorName,
        actionText: `moved ${issueRef} to ${toStatus}`,
      };
    }
    case "issue.created":
      return {
        actorName,
        actionText: `created ${issueRef}`,
        details: meta.title ? `"${meta.title}"` : null,
      };
    case "issue.assigned":
      return {
        actorName,
        actionText: meta.assignee_id ? `assigned ${issueRef}` : `unassigned ${issueRef}`,
      };
    case "issue.approved":
      return {
        actorName,
        actionText: `approved ${issueRef}`,
      };
    case "issue.rejected":
      return {
        actorName,
        actionText: `rejected ${issueRef}`,
        details: meta.reason ? `Reason: "${meta.reason}"` : null,
      };
    case "issue.resubmitted":
      return {
        actorName,
        actionText: `resubmitted ${issueRef} for approval`,
      };
    case "issue.updated":
      return {
        actorName,
        actionText: `updated ${issueRef}`,
      };
    case "issue.deleted":
      return {
        actorName,
        actionText: `deleted ${issueRef}`,
        details: meta.title ? `"${meta.title}"` : null,
      };
    case "comment.added":
      return {
        actorName,
        actionText: `commented on ${issueRef}`,
      };
    case "comment.deleted":
      return {
        actorName,
        actionText: `deleted a comment on ${issueRef}`,
      };
    case "project.created":
      return {
        actorName,
        actionText: `created project ${meta.name ? `"${meta.name}"` : ""}`.trim(),
      };
    case "project.updated":
      return {
        actorName,
        actionText: `updated project settings`,
      };
    case "project.archived":
      return {
        actorName,
        actionText: `archived the project`,
      };
    case "project.unarchived":
      return {
        actorName,
        actionText: `unarchived the project`,
      };
    case "access.requested":
      return {
        actorName,
        actionText: `requested project access`,
      };
    case "access.approved":
      return {
        actorName,
        actionText: `approved project access`,
      };
    case "access.rejected":
      return {
        actorName,
        actionText: `rejected project access request`,
      };
    case "access.revoked":
      return {
        actorName,
        actionText: `revoked project access`,
      };
    case "member.invited":
      return {
        actorName,
        actionText: `invited ${meta.email || "a user"} as ${meta.role || "member"}`,
      };
    case "member.joined":
      return {
        actorName,
        actionText: `joined the organization`,
      };
    case "member.role_changed":
      return {
        actorName,
        actionText: `changed member role to ${meta.to || "member"}`,
      };
    case "member.removed":
      return {
        actorName,
        actionText: `removed a member from the organization`,
      };
    default:
      return {
        actorName,
        actionText: `performed ${entry.action.replace(".", " ")}`,
      };
  }
}

export default function ActivityTimeline({
  fetchActivity,
  currentIssueId,
  emptyMessage = "No activity recorded yet.",
}: ActivityTimelineProps) {
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityRef = useRef(fetchActivity);
  fetchActivityRef.current = fetchActivity;

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchActivityRef.current();
      setItems(res.items || []);
      setNextCursor(res.next_cursor);
    } catch (err: any) {
      console.error("Failed to load activity:", err);
      setError(err?.message || "Failed to load activity timeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await fetchActivityRef.current(nextCursor);
      setItems((prev) => [...prev, ...(res.items || [])]);
      setNextCursor(res.next_cursor);
    } catch (err: any) {
      console.error("Failed to load more activity:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-xs">Loading activity timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {items.map((entry) => {
          const { actorName, actionText, details } = formatActivityAction(entry, currentIssueId);
          const relativeTime = formatRelativeTime(entry.created_at);
          const exactTime = formatExactTime(entry.created_at);
          const initials = actorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

          return (
            <div key={entry.id} className="relative group text-xs text-zinc-300">
              {/* Timeline marker / avatar dot */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-indigo-300">{initials[0]}</span>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center flex-wrap gap-1 leading-relaxed">
                  <span className="font-semibold text-zinc-100">{actorName}</span>
                  <span>{actionText}</span>
                  {entry.metadata?.super_admin && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Super Admin
                    </span>
                  )}
                  <span
                    className="text-zinc-500 hover:text-zinc-400 transition-colors cursor-help ml-auto text-[11px]"
                    title={exactTime}
                  >
                    {relativeTime}
                  </span>
                </div>

                {details && (
                  <div className="text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded px-2.5 py-1.5 mt-1 italic">
                    {details}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {nextCursor !== null && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>View more</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

