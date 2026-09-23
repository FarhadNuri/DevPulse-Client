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
    <div className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg text-gray-800">{project.name}</h3>

      {!locked && (
        <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium" onClick={() => onOpen(project.id)}>
          Open board
        </button>
      )}

      {locked && project.access_status === "pending" && (
        <span className="mt-3 inline-block text-yellow-600 font-medium">Pending approval</span>
      )}

      {locked && (project.access_status === "rejected" || project.access_status === "revoked" || !project.access_status) && (
        <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium" onClick={() => onRequestAccess(project.id)}>
          Request access
        </button>
      )}
    </div>
  );
}
