import type { IssueStatus } from "./types";

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "_");
}

export function denormalizeStatus(status: IssueStatus): string {
  const map: Record<IssueStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return map[status] || status;
}

export const STATUS_VALUES = ["open", "in_progress", "resolved"] as const;

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature_request: "Feature Request",
};

export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;

  return `${Math.floor(diffInDays / 365)}y ago`;
}

export function formatExactTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
