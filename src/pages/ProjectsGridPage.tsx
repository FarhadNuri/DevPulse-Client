import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects as projectsApi } from "../api";
import { useOrg } from "../hooks";
import ProjectCard from "../components/ProjectCard";
import NewProjectModal from "../components/NewProjectModal";
import Spinner from "../components/Spinner";
import type { Project } from "../types";
import toast from "react-hot-toast";

export default function ProjectsGridPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const numOrgId = Number(orgId);
  const { isMaintainer, currentOrg } = useOrg();
  const navigate = useNavigate();

  const [list, setList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestingId, setRequestingId] = useState<number | null>(null);

  const loadProjects = useCallback(async () => {
    if (isNaN(numOrgId) || numOrgId <= 0) return;
    try {
      setLoading(true);
      const data = await projectsApi.list(numOrgId);
      setList(data || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [numOrgId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleRequestAccess(projectId: number) {
    setRequestingId(projectId);
    try {
      await projectsApi.requestAccess(numOrgId, projectId);
      toast.success("Access requested");
      await loadProjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to request access");
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="p-6 max-w-7xl w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-muted mt-1">
            {currentOrg?.name ? `Organization: ${currentOrg.name}` : "Workspace Projects"}
          </p>
        </div>
        {isMaintainer && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md font-medium text-sm transition cursor-pointer self-start sm:self-auto"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-bg-secondary border border-border rounded-xl">
          <h3 className="text-lg font-medium text-text-primary mb-2">No projects yet</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
            {isMaintainer
              ? "Get started by creating your organization's first project."
              : "No projects are currently available in this organization."}
          </p>
          {isMaintainer && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md font-medium text-sm transition"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(pId) => navigate(`/orgs/${numOrgId}/projects/${pId}`)}
              onRequestAccess={handleRequestAccess}
              requesting={requestingId === project.id}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          orgId={numOrgId}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
