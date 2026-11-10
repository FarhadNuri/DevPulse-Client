import { useState, useEffect, useRef } from "react";
import { projects as projectsApi } from "../api";
import type { ProjectMember } from "../types";

interface AssigneePickerProps {
  orgId: number;
  projectId: number;
  currentAssignee: { id: number; name: string; email?: string } | null | undefined;
  canEdit: boolean;
  onAssigneeChange: (assigneeId: number | null) => Promise<void> | void;
}

export default function AssigneePicker({
  orgId,
  projectId,
  currentAssignee,
  canEdit,
  onAssigneeChange,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch candidate assignees (contributors & maintainers)
  useEffect(() => {
    if (!canEdit || !projectId || !orgId) return;

    let mounted = true;
    setLoading(true);

    projectsApi
      .listMembers(orgId, projectId)
      .then((mList: ProjectMember[]) => {
        if (!mounted) return;
        const approvedContributors = (mList || [])
          .filter((m) => m.role === "contributor" && m.status === "approved")
          .map((m) => ({
            id: m.user?.id || m.user_id || m.id,
            name: m.user?.name || m.name || `User #${m.user_id || m.id}`,
            email: m.user?.email || m.email || "",
          }));

        // Deduplicate
        const uniqueMap = new Map<number, { id: number; name: string; email: string }>();
        approvedContributors.forEach((c) => uniqueMap.set(c.id, c));
        setCandidates(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        // Silently catch member fetch errors
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [orgId, projectId, canEdit]);

  function getInitials(name: string) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm border transition ${
          canEdit
            ? "bg-bg-tertiary border-border hover:border-border-focus/60 cursor-pointer text-text-primary"
            : "bg-bg-secondary border-border/50 text-text-muted cursor-default"
        }`}
      >
        {currentAssignee ? (
          <>
            <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-semibold text-[10px] flex items-center justify-center shrink-0">
              {getInitials(currentAssignee.name)}
            </div>
            <span className="truncate max-w-[120px] font-medium">{currentAssignee.name}</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full border border-dashed border-border-focus text-text-muted text-[10px] flex items-center justify-center shrink-0">
              👤
            </div>
            <span className="text-text-muted italic">Unassigned</span>
          </>
        )}
        {canEdit && <span className="text-[10px] text-text-muted ml-0.5">▼</span>}
      </button>

      {open && canEdit && (
        <div className="absolute left-0 mt-1.5 w-60 bg-bg-secondary border border-border rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-text-muted tracking-wider border-b border-border/50">
            Assign To
          </div>

          <button
            type="button"
            onClick={() => {
              onAssigneeChange(null);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition text-left hover:bg-bg-tertiary cursor-pointer ${
              !currentAssignee ? "bg-accent/10 text-accent font-medium" : "text-text-secondary"
            }`}
          >
            <span className="w-4 text-center">✕</span>
            <span>Unassigned</span>
          </button>

          {loading ? (
            <div className="p-3 text-xs text-text-muted text-center">Loading members...</div>
          ) : candidates.length === 0 ? (
            <div className="p-3 text-xs text-text-muted text-center italic">
              No approved contributors found
            </div>
          ) : (
            candidates.map((cand) => {
              const isSelected = currentAssignee?.id === cand.id;
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => {
                    onAssigneeChange(cand.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition text-left hover:bg-bg-tertiary cursor-pointer ${
                    isSelected ? "bg-accent/10 text-accent font-semibold" : "text-text-primary"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-semibold text-[10px] flex items-center justify-center shrink-0">
                    {getInitials(cand.name)}
                  </div>
                  <div className="truncate">
                    <div className="truncate font-medium">{cand.name}</div>
                    {cand.email && (
                      <div className="truncate text-[10px] text-text-muted">{cand.email}</div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
