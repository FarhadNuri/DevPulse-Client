import React, { useEffect, useState } from "react";
import { projects as projectsApi } from "../api";
import { useAuth } from "../hooks";
import ProjectCard from "../components/ProjectCard";
import NewProjectModal from "../components/NewProjectModal";
import { useNavigate } from "react-router-dom";

export default function ProjectsGridPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  async function loadProjects() {
    try {
      const data = await projectsApi.list();
      setList(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleRequestAccess(id: number) {
    try {
      await projectsApi.requestAccess(String(id));
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  }

  if (!user) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {user.role === "maintainer" && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors" onClick={() => setShowModal(true)}>
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isMaintainer={user.role === "maintainer"}
            onOpen={(id) => navigate(`/projects/${id}`)}
            onRequestAccess={handleRequestAccess}
          />
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No projects found.
          </div>
        )}
      </div>

      {showModal && (
        <NewProjectModal
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
