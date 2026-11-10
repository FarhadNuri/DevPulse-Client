import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { issues as issuesApi } from "../api";
import { useAuth, useOrg } from "../hooks";
import type { Issue, IssueType, IssueStatus } from "../types";
import { formatDate, STATUS_LABELS, TYPE_LABELS, STATUS_VALUES } from "../utils";
import toast from "react-hot-toast";

const typeColors: Record<string, string> = {
  bug: "bg-red-500/15 text-red-400 border border-red-500/30",
  feature_request: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
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

const columnConfig: { status: IssueStatus; label: string; accent: string }[] = [
  { status: "open", label: "Open", accent: "border-t-open" },
  { status: "in_progress", label: "In Progress", accent: "border-t-in-progress" },
  { status: "resolved", label: "Resolved", accent: "border-t-resolved" },
];

function getInitials(name: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface KanbanBoardProps {
  orgId: number;
  issues: Issue[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  onRefetch: () => void;
  typeFilter: "all" | IssueType;
  onViewDetails: (issue: Issue) => void;
}

function SortableCard({
  issue,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  disabled,
  onViewDetails,
}: {
  orgId: number;
  issue: Issue;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: number) => void;
  disabled: boolean;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string } | null;
  onViewDetails: (issue: Issue) => void;
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
      {...(!disabled ? listeners : {})}
      className={`bg-bg-secondary border border-border rounded-lg p-3 transition select-none ${
        disabled ? "" : "cursor-grab active:cursor-grabbing hover:border-border-focus/30"
      }`}
    >
      <div
        className="cursor-pointer"
        onClick={() => onViewDetails(issue)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-text-primary line-clamp-2">
            {issue.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <button
                onClick={() => onEdit(issue)}
                className="text-xs text-text-muted hover:text-text-primary transition p-1 hover:bg-bg-tertiary rounded cursor-pointer"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(issue.id)}
                className="text-xs text-text-muted hover:text-red-400 transition p-1 hover:bg-red-500/10 rounded cursor-pointer"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {issue.description && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        )}

        {/* Labels chips */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {issue.labels.map((lbl) => (
              <span
                key={lbl.id}
                style={{
                  backgroundColor: `${lbl.color}20`,
                  color: lbl.color,
                  borderColor: `${lbl.color}40`,
                }}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border truncate max-w-[100px]"
              >
                {lbl.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-mono font-semibold text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded border border-border">
            #{issue.id}
          </span>
          <span
            className={`text-[10px] font-medium rounded-md px-1.5 py-0.5 ${
              typeColors[issue.type]
            }`}
          >
            {TYPE_LABELS[issue.type] ?? issue.type}
          </span>
          {issue.approval_status && (
            <span
              className={`text-[10px] font-medium rounded-md px-1.5 py-0.5 ${
                approvalColors[issue.approval_status]
              }`}
            >
              {approvalLabels[issue.approval_status] ?? issue.approval_status}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            {issue.assignee ? (
              <div
                className="w-4 h-4 rounded-full bg-accent/20 text-accent font-bold text-[9px] flex items-center justify-center shrink-0 border border-accent/40"
                title={`Assigned to ${issue.assignee.name}`}
              >
                {getInitials(issue.assignee.name)}
              </div>
            ) : null}
            <span className="truncate max-w-[90px]">{issue.reporter?.name ?? "Unknown"}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(Number(issue.comment_count) > 0 || issue.comment_count === 0) && (
              <span className="flex items-center gap-1 text-[11px]">
                <span>💬</span>
                <span>{issue.comment_count || 0}</span>
              </span>
            )}
            <span>{formatDate(issue.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardOverlay({ issue }: { issue: Issue }) {
  return (
    <div className="bg-bg-secondary border-2 border-accent rounded-lg p-3 shadow-xl opacity-90 rotate-1 max-w-sm">
      <h4 className="text-sm font-semibold text-text-primary line-clamp-2">
        {issue.title}
      </h4>
      <p className="text-xs text-text-muted mt-1 line-clamp-2">
        {issue.description}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-xs font-mono font-semibold text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded border border-border">
          #{issue.id}
        </span>
        <span
          className={`text-xs font-medium rounded-md px-2 py-0.5 ${
            typeColors[issue.type]
          }`}
        >
          {TYPE_LABELS[issue.type] ?? issue.type}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  children,
  count,
}: {
  id: IssueStatus;
  label: string;
  accent: string;
  count: number;
  children: ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-border border-t-2 ${
        id === "open"
          ? "border-t-open"
          : id === "in_progress"
          ? "border-t-in-progress"
          : "border-t-resolved"
      } bg-bg-primary flex flex-col min-h-[160px] transition-colors ${
        isOver ? "bg-bg-tertiary/20" : ""
      }`}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
        <span className="text-xs font-mono bg-bg-secondary text-text-secondary rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="p-2 space-y-2 flex-1">{children}</div>
    </div>
  );
}

export default function KanbanBoard({
  orgId,
  issues,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onRefetch,
  typeFilter,
  onViewDetails,
}: KanbanBoardProps) {
  const { isLoggedIn, user } = useAuth();
  const { isGuest } = useOrg();
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      // Clients and guests are strictly read-only on the board
      if (!over || !isLoggedIn || isGuest) return;

      const issueId = Number(active.id);
      let targetStatus: IssueStatus | null = null;
      const overId = String(over.id);

      if (STATUS_VALUES.includes(overId as IssueStatus)) {
        targetStatus = overId as IssueStatus;
      } else {
        const overIssue = issues.find((i) => String(i.id) === overId);
        if (overIssue) {
          const normalized = overIssue.status.toLowerCase().replace(/\s+/g, "_");
          targetStatus = normalized as IssueStatus;
        }
      }

      if (!targetStatus) return;

      const currentIssue = issues.find((i) => i.id === issueId);
      if (!currentIssue) return;

      const currentNormalized = currentIssue.status.toLowerCase().replace(/\s+/g, "_");
      if (currentNormalized === targetStatus) return;

      try {
        await issuesApi.update(orgId, issueId, { status: targetStatus });
        toast.success(`Moved to ${STATUS_LABELS[targetStatus]}`);
        onRefetch();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update issue status");
      }
    },
    [issues, isLoggedIn, isGuest, orgId, onRefetch],
  );

  // Clients/guests cannot drag
  const isDndDisabled = isGuest || !canEdit;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={!isDndDisabled ? handleDragStart : undefined}
      onDragEnd={!isDndDisabled ? handleDragEnd : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnConfig.map((col) => {
          const colIssues = columns[col.status] || [];
          return (
            <KanbanColumn
              key={col.status}
              id={col.status}
              label={col.label}
              accent={col.accent}
              count={colIssues.length}
            >
              <SortableContext
                items={colIssues.map((i) => String(i.id))}
                strategy={verticalListSortingStrategy}
                disabled={isDndDisabled}
              >
                {colIssues.length === 0 ? (
                  <div className="text-center py-8 text-xs text-text-muted italic">
                    No issues
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <SortableCard
                      key={issue.id}
                      orgId={orgId}
                      issue={issue}
                      canEdit={canEdit && !isGuest}
                      canDelete={canDelete && !isGuest}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      disabled={isDndDisabled}
                      isLoggedIn={isLoggedIn}
                      currentUser={user}
                      onViewDetails={onViewDetails}
                    />
                  ))
                )}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>

      {!isDndDisabled && (
        <DragOverlay>
          {activeIssue ? <CardOverlay issue={activeIssue} /> : null}
        </DragOverlay>
      )}
    </DndContext>
  );
}
