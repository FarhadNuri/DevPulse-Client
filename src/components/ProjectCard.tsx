import type { Project } from "../types";

type Props = {
  project: Project;
  onOpen: (id: number) => void;
  onRequestAccess: (id: number) => void;
  requesting?: boolean;
};

export default function ProjectCard({
  project,
  onOpen,
  onRequestAccess,
  requesting = false,
}: Props) {
  const { access_status } = project;
  const canOpen = access_status === "full" || access_status === "approved";

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5 shadow-sm hover:border-border-focus/40 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-text-primary">
            {project.name}
          </h3>
          {project.archived && (
            <span className="text-[10px] uppercase font-mono tracking-wider bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded">
              Archived
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-xs text-text-muted line-clamp-2 mb-4">
            {project.description}
          </p>
        )}
        {project.counts && canOpen && (
          <div className="flex items-center gap-2 text-xs text-text-muted mt-2 mb-4">
            <span className="bg-bg-tertiary px-2 py-0.5 rounded">
              {project.counts.open} open
            </span>
            <span className="bg-bg-tertiary px-2 py-0.5 rounded">
              {project.counts.in_progress} in progress
            </span>
            <span className="bg-bg-tertiary px-2 py-0.5 rounded">
              {project.counts.resolved} resolved
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        {canOpen && (
          <button
            className="w-full cursor-pointer text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-4 py-2 rounded-md border border-accent/30 text-center"
            onClick={() => onOpen(project.id)}
          >
            Open board
          </button>
        )}

        {access_status === "none" && (
          <button
            className="w-full cursor-pointer text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-4 py-2 rounded-md border border-accent/30 disabled:opacity-50"
            disabled={requesting}
            onClick={() => onRequestAccess(project.id)}
          >
            {requesting ? "Sending..." : "Request access"}
          </button>
        )}

        {access_status === "pending" && (
          <span className="w-full inline-block text-center text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-md text-sm font-medium">
            Request sent
          </span>
        )}

        {(access_status === "rejected" || access_status === "revoked") && (
          <div className="space-y-2">
            <div className="text-xs text-red-400 capitalize text-center">
              Access {access_status}
            </div>
            <button
              className="w-full cursor-pointer text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-4 py-2 rounded-md border border-accent/30 disabled:opacity-50"
              disabled={requesting}
              onClick={() => onRequestAccess(project.id)}
            >
              {requesting ? "Sending..." : "Request again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
