import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
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
  onDelete: (id: string) => void;
  onRefetch: () => void;
  typeFilter: "all" | IssueType;
}

function KanbanCard({
  issue,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  isDragDisabled,
  dragProps,
}: {
  issue: Issue;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (issue: Issue) => void;
  onDelete: (id: string) => void;
  isDragDisabled: boolean;
  dragProps?: Record<string, unknown>;
}) {
  return (
    <div
      {...dragProps}
      className={`bg-bg-secondary border border-border rounded-lg p-3 transition ${
        isDragDisabled
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing hover:border-border-focus/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-text-primary leading-snug">{issue.title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && (
            <button
              onClick={() => onEdit(issue)}
              className="text-xs text-text-muted hover:text-text-primary transition px-1 py-0.5 rounded hover:bg-bg-tertiary"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(issue._id)}
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
          {issue.reporter?.name ?? "Unknown"} · {formatDate(issue.createdAt)}
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
  const [pendingDragId, setPendingDragId] = useState<string | null>(null);

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

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId) return;
      if (!isLoggedIn) return;

      const newStatus = destination.droppableId as IssueStatus;
      setPendingDragId(draggableId);

      try {
        await issuesApi.update(draggableId, { status: newStatus });
        toast.success(`Moved to ${STATUS_LABELS[newStatus] ?? newStatus}`);
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columnConfig.map(({ status, label, accent }) => (
            <div key={status} className={`rounded-lg border border-border border-t-2 ${accent} bg-bg-primary flex flex-col max-h-[calc(100vh-14rem)]`}>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-2 overflow-y-auto min-h-[6rem] rounded-b-lg transition-colors ${
                      snapshot.isDraggingOver ? "bg-bg-tertiary/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-bg-primary py-1 z-10">
                      <h3 className="text-sm font-semibold text-text-primary">{label}</h3>
                      <span className="text-xs font-mono text-text-muted bg-bg-tertiary rounded-full px-2 py-0.5">
                        {columns[status]?.length ?? 0}
                      </span>
                    </div>
                    {(columns[status] ?? []).map((issue, index) => (
                      <Draggable
                        key={issue._id}
                        draggableId={issue._id}
                        index={index}
                        isDragDisabled={!isLoggedIn}
                      >
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`transition-opacity ${
                              pendingDragId === issue._id ? "opacity-50" : ""
                            }`}
                          >
                            <KanbanCard
                              issue={issue}
                              canEdit={canEdit}
                              canDelete={canDelete}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              isDragDisabled={!isLoggedIn}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
