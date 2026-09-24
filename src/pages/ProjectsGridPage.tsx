import { useEffect, useState } from "react";
import { projects as projectsApi } from "../api";
import { useAuth } from "../hooks";
import ProjectCard from "../components/ProjectCard";
import NewProjectModal from "../components/NewProjectModal";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ProjectsGridPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

  async function loadProjects() {
    try {
      const data = await projectsApi.list();
      setList(data);
      if (user?.role === "maintainer") {
        const pendingData = await projectsApi.pending();
        setPendingList(pendingData);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [user]);

  async function handleRequestAccess(id: number) {
    try {
      await projectsApi.requestAccess(String(id));
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  }

  if (!user) return null;

  const isMaintainer = user?.role === "maintainer";
  const isClient = user?.role === "client";

  async function handleApproveProject(id: number, action: "approved" | "rejected") {
    try {
      await projectsApi.approve(String(id), action);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
          {(isMaintainer || isClient) && (
            <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer" onClick={() => setShowModal(true)}>
              New Project
            </button>
          )}
        </div>

        {isMaintainer && (
          <div className="flex items-center gap-4 border-b border-border mb-6 pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`text-sm font-medium transition ${activeTab === "all" ? "text-accent border-b-2 border-accent" : "text-text-muted hover:text-text-primary"}`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`text-sm font-medium transition flex items-center gap-2 ${activeTab === "pending" ? "text-accent border-b-2 border-accent" : "text-text-muted hover:text-text-primary"}`}
            >
              Pending Approval
              {pendingList.length > 0 && (
                <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingList.length}
                </span>
              )}
            </button>
          </div>
        )}

        {activeTab === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isMaintainer={isMaintainer}
                isClient={isClient}
                onOpen={(id) => navigate(`/projects/${id}`)}
                onRequestAccess={handleRequestAccess}
              />
            ))}
            {list.length === 0 && (
              <div className="col-span-full text-center py-16 text-text-muted">
                No projects found.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingList.map((project) => (
              <div key={project.id} className="bg-bg-secondary border border-border rounded-lg p-4 shadow-sm relative">
                <h3 className="text-base font-semibold text-text-primary mb-4">{project.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveProject(project.id, "approved")} className="text-xs font-medium text-green-500 bg-green-500/10 hover:bg-green-500/20 transition px-3 py-1.5 rounded-md border border-green-500/20 cursor-pointer">
                    Approve
                  </button>
                  <button onClick={() => handleApproveProject(project.id, "rejected")} className="text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition px-3 py-1.5 rounded-md border border-red-500/20 cursor-pointer">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingList.length === 0 && (
              <div className="col-span-full text-center py-16 text-text-muted">
                No pending project requests.
              </div>
            )}
          </div>
        )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadProjects();
          }}
        />
      )}
      </main>
    </div>
  );
}
