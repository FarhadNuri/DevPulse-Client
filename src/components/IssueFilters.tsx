import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../hooks";
import { projects as projectsApi } from "../api";
import type { ProjectMember } from "../types";

interface IssueFiltersProps {
  orgId: number;
  projectId: number;
  currentUserId?: number;
}

export default function IssueFilters({ orgId, projectId, currentUserId }: IssueFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state (primitives)
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "all";
  const urlType = searchParams.get("type") || "all";
  const urlAssignee = searchParams.get("assignee") || "all";

  // Local search state for debouncing
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Candidate assignees
  const [candidates, setCandidates] = useState<{ id: number; name: string }[]>([]);

  // Sync debounced search to URL cleanly without infinite loops
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedSearch.trim()) {
            next.set("search", debouncedSearch.trim());
          } else {
            next.delete("search");
          }
          next.set("page", "1");
          return next;
        },
        { replace: true }
      );
    }
  }, [debouncedSearch, urlSearch, setSearchParams]);

  // Keep input in sync if URL search changes from another source (e.g. reset)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Fetch candidate members
  useEffect(() => {
    if (!orgId || !projectId) return;
    projectsApi.listMembers(orgId, projectId).then((res: ProjectMember[]) => {
      const approved = (res || [])
        .filter((m) => m.role === "contributor" && m.status === "approved")
        .map((m) => ({
          id: m.user?.id || m.user_id || m.id,
          name: m.user?.name || m.name || `User #${m.user_id || m.id}`,
        }));
      const map = new Map<number, { id: number; name: string }>();
      approved.forEach((c) => map.set(c.id, c));
      setCandidates(Array.from(map.values()));
    }).catch(() => {});
  }, [orgId, projectId]);

  function updateFilter(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === "all") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        next.set("page", "1");
        return next;
      },
      { replace: true }
    );
  }

  function clearAllFilters() {
    setSearchInput("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const issueParam = prev.get("issue");
        if (issueParam) next.set("issue", issueParam);
        return next;
      },
      { replace: true }
    );
  }

  const hasActiveFilters =
    !!urlSearch ||
    urlStatus !== "all" ||
    urlType !== "all" ||
    urlAssignee !== "all";

  const selectCls =
    "bg-bg-primary border border-border rounded-md px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-focus transition cursor-pointer";

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-3 mb-5 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
        {/* Search input (debounced 400ms) - without emoji */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search issues (title, description)..."
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-1.5 pr-8 text-xs text-text-primary focus:outline-none focus:border-border-focus transition placeholder:text-text-muted"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={urlStatus}
            onChange={(e) => updateFilter("status", e.target.value)}
            className={selectCls}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={urlType}
            onChange={(e) => updateFilter("type", e.target.value)}
            className={selectCls}
          >
            <option value="all">All Types</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
          </select>
        </div>

        {/* Assignee filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={urlAssignee}
            onChange={(e) => updateFilter("assignee", e.target.value)}
            className={selectCls}
          >
            <option value="all">All Assignees</option>
            {currentUserId && <option value="me">Assigned to Me</option>}
            <option value="none">Unassigned</option>
            {candidates.map((cand) => (
              <option key={cand.id} value={String(cand.id)}>
                {cand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-text-muted hover:text-accent font-medium transition cursor-pointer px-2 py-1 shrink-0"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
