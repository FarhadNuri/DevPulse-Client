import React from 'react';

type Props = {
  project: { id: number; name: string; access_status?: string | null };
  isMaintainer: boolean;
  onOpen: (id: number) => void;
  onRequestAccess: (id: number) => void;
};

export default function ProjectCard({ project, isMaintainer, onOpen, onRequestAccess }: Props) {
  const locked = !isMaintainer && project.access_status !== "approved";

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 shadow-sm hover:border-border-focus/30 transition-colors">
      <h3 className="text-base font-semibold text-text-primary">{project.name}</h3>

      {!locked && (
        <button className="mt-4 cursor-pointer text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-4 py-2 rounded-md border border-accent/30" onClick={() => onOpen(project.id)}>
          Open board
        </button>
      )}

      {locked && project.access_status === "pending" && (
        <span className="mt-4 inline-block text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-md text-sm font-medium">Pending approval</span>
      )}

      {locked && (project.access_status === "rejected" || project.access_status === "revoked" || !project.access_status) && (
        <button className="mt-4 cursor-pointer text-sm font-medium text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 transition px-4 py-2 rounded-md border border-accent/30" onClick={() => onRequestAccess(project.id)}>
          Request access
        </button>
      )}
    </div>
  );
}
