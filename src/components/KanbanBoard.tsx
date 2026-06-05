import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { issues as issuesApi } from "../api";
import { useAuth } from "../hooks";
import type { Issue, IssueType, IssueStatus } from "../types";
import { formatDate, STATUS_LABELS, TYPE_LABELS, STATUS_VALUES } from "../utils";
import toast from "react-hot-toast";

const typeColors: Record<string, string> = {
  bug: "bg-bug/15 text-bug",
  feature_request: "bg-feature/15 text-feature",
};

const columnConfig: { status: IssueStatus; label: string; accent: string }[] = [
  { status: "open", label: "Open", accent: "border-t-open" },
  { status: "in_progress", label: "In Progress", accent: "border-t-in-progress" },
  { status: "resolved", label: "Resolved", accent: "border-t-resolved" },
];

interface KanbanBoardProps {
  issues: Issue[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  onRefetch: () => void;
  typeFilter: "all" | IssueType;
}

function SortableCard({
  issue,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  disabled,
}: {
  issue: Issue;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(issue.id), disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-bg-secondary border border-border rounded-lg p-3 transition select-none ${
        disabled
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing hover:border-border-focus/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-text-primary leading-snug">{issue.title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(issue);
              }}
              className="text-xs text-text-muted hover:text-text-primary transition px-1 py-0.5 rounded hover:bg-bg-tertiary"
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
              className="text-xs text-text-muted hover:text-red-400 transition px-1 py-0.5 rounded hover:bg-bg-tertiary"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${typeColors[issue.type]}`}>
          {TYPE_LABELS[issue.type] ?? issue.type}
        </span>
        <span className="text-xs text-text-muted ml-auto">
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.created_at)}
        </span>
      </div>
    </div>
  );
}

function DragOverlayCard({ issue }: { issue: Issue }) {
  return (
    <div className="bg-bg-secondary border border-border-focus rounded-lg p-3 shadow-xl rotate-1">
      <h4 className="text-sm font-semibold text-text-primary leading-snug mb-2">{issue.title}</h4>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${typeColors[issue.type]}`}>
          {TYPE_LABELS[issue.type] ?? issue.type}
        </span>
        <span className="text-xs text-text-muted">
          {issue.reporter?.name ?? "Unknown"}
        </span>
      </div>
    </div>
  );
}

export default function KanbanBoard({
  issues,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onRefetch,
  typeFilter,
}: KanbanBoardProps) {
  const { isLoggedIn } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [pendingDragId, setPendingDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const filteredIssues = issues.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    return true;
  });

  const columns: Record<string, Issue[]> = {};
  for (const status of STATUS_VALUES) {
    columns[status] = [];
  }
  for (const issue of filteredIssues) {
    const normalized = issue.status.toLowerCase().replace(/\s+/g, "_") as IssueStatus;
    if (columns[normalized]) {
      columns[normalized].push(issue);
    }
  }

  const activeIssue = activeId
    ? issues.find((i) => String(i.id) === activeId)
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const over = event.over;
    if (!over) {
      setOverColumn(null);
      return;
    }
    const overId = String(over.id);
    if (STATUS_VALUES.includes(overId as IssueStatus)) {
      setOverColumn(overId);
    } else {
      const overIssue = issues.find((i) => String(i.id) === overId);
      if (overIssue) {
        setOverColumn(overIssue.status);
      }
    }
  }, [issues]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverColumn(null);

      if (!over || !isLoggedIn) return;

      const issueId = Number(active.id);

      let targetStatus: IssueStatus | null = null;
      const overId = String(over.id);

      if (STATUS_VALUES.includes(overId as IssueStatus)) {
        targetStatus = overId as IssueStatus;
      } else {
        const overIssue = issues.find((i) => String(i.id) === overId);
        if (overIssue) {
          targetStatus = overIssue.status;
        }
      }

      if (!targetStatus) return;

      const currentIssue = issues.find((i) => i.id === issueId);
      if (!currentIssue || currentIssue.status === targetStatus) return;

      setPendingDragId(String(issueId));

      try {
        await issuesApi.update(issueId, {
          title: currentIssue.title,
          description: currentIssue.description,
          type: currentIssue.type,
          status: targetStatus,
        });
        toast.success(`Moved to ${STATUS_LABELS[targetStatus]}`);
        onRefetch();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to move issue");
        onRefetch();
      } finally {
        setPendingDragId(null);
      }
    },
    [issues, isLoggedIn, onRefetch],
  );

  return (
    <div className="relative">
      {!isLoggedIn && (
        <div className="absolute top-0 left-0 right-0 z-10 text-center py-2">
          <span className="text-xs text-text-muted bg-bg-tertiary/80 rounded-full px-3 py-1">
            Login to move issues
          </span>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columnConfig.map(({ status, label, accent }) => {
            const columnIssues = columns[status] ?? [];
            const isOver = overColumn === status;

            return (
              <div
                key={status}
                className={`rounded-lg border border-border border-t-2 ${accent} bg-bg-primary flex flex-col max-h-[calc(100vh-14rem)] transition-colors ${
                  isOver ? "bg-bg-tertiary/20" : ""
                }`}
              >
                <SortableContext
                  id={status}
                  items={columnIssues.map((i) => String(i.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[6rem]">
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-bg-primary py-1 z-10">
                      <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
                      <span className="text-xs font-mono text-text-muted bg-bg-tertiary rounded-full px-2 py-0.5">
                        {columnIssues.length}
                      </span>
                    </div>
                    {columnIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`transition-opacity ${
                          pendingDragId === String(issue.id) ? "opacity-50" : ""
                        }`}
                      >
                        <SortableCard
                          issue={issue}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          disabled={!isLoggedIn}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeIssue ? <DragOverlayCard issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
