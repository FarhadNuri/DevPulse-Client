import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { projects as projectsApi } from "../api";
import { useAuth } from "../hooks";
import type { Project } from "../types";
import Spinner from "../components/Spinner";

interface EnrichedProject extends Project {
  orgName: string;
  orgRole: string;
}

export default function DashboardPage() {
  const { user, organizations } = useAuth();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState<EnrichedProject[]>([]);
  const [loading, setLoading] = useState(true);

  // If super admin visits, redirect immediately to /admin
  useEffect(() => {
    if (user?.is_super_admin) {
      navigate("/admin", { replace: true });
    }
  }, [user?.is_super_admin, navigate]);

  // Fetch projects across all user organizations
  useEffect(() => {
    if (organizations.length === 0) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all(
      organizations.map(async (org) => {
        try {
          const list = await projectsApi.list(org.id);
          return (list || []).map((p) => ({
            ...p,
            orgName: org.name,
            orgRole: org.role,
          }));
        } catch {
          return [] as EnrichedProject[];
        }
      })
    )
      .then((results) => {
        if (!active) return;
        setAllProjects(results.flat());
      })
      .catch((err) => {
        console.error("Failed to load dashboard projects:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [organizations]);

  // Calculated aggregate metrics
  const stats = useMemo(() => {
    const totalProjects = allProjects.length;
    let totalOpen = 0;
    let totalInProgress = 0;
    let totalResolved = 0;

    for (const p of allProjects) {
      totalOpen += Number(p.counts?.open) || 0;
      totalInProgress += Number(p.counts?.in_progress) || 0;
      totalResolved += Number(p.counts?.resolved) || 0;
    }

    const totalTickets = totalOpen + totalInProgress + totalResolved;
    const resolutionRate =
      totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 0;

    return {
      totalWorkspaces: organizations.length,
      totalProjects,
      totalOpen,
      totalInProgress,
      totalResolved,
      totalTickets,
      resolutionRate,
    };
  }, [allProjects, organizations]);

  // SVG Ring Chart calculation (Circumference with radius = 52)
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // ~326.726

  const ringSegments = useMemo(() => {
    if (stats.totalTickets === 0) return null;

    const openLength = (stats.totalOpen / stats.totalTickets) * circumference;
    const inProgressLength =
      (stats.totalInProgress / stats.totalTickets) * circumference;
    const resolvedLength =
      (stats.totalResolved / stats.totalTickets) * circumference;

    return {
      open: {
        dasharray: `${openLength} ${circumference}`,
        dashoffset: 0,
      },
      inProgress: {
        dasharray: `${inProgressLength} ${circumference}`,
        dashoffset: -openLength,
      },
      resolved: {
        dasharray: `${resolvedLength} ${circumference}`,
        dashoffset: -(openLength + inProgressLength),
      },
    };
  }, [stats, circumference]);

  return (
    <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-bg-secondary via-bg-secondary to-bg-tertiary border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                WORKSPACE ACTIVE
              </span>
              <span className="text-xs text-text-muted">
                {organizations.length} {organizations.length === 1 ? "Organization" : "Organizations"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Welcome back, {user?.name || "Developer"}!
            </h1>
            <p className="text-sm text-text-muted mt-1.5 max-w-2xl leading-relaxed">
              Logged in as <span className="text-text-primary font-medium">{user?.email}</span>.
              Here is an overview of active projects, ticket resolutions, and workspace metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workspaces */}
        <div className="bg-bg-secondary border border-border hover:border-accent/40 rounded-xl p-5 transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
              Workspaces
            </span>
            {/* <span className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold">
              🏢
            </span> */}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-primary">
              {stats.totalWorkspaces}
            </div>
            <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <span>Joined organizations</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-bg-secondary border border-border hover:border-blue-500/40 rounded-xl p-5 transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
              Active Projects
            </span>
            {/* <span className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center text-sm font-semibold">
              📁
            </span> */}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-primary">
              {stats.totalProjects}
            </div>
            <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <span>Across all workspaces</span>
            </div>
          </div>
        </div>

        {/* Active Tickets (Open + In Progress) */}
        <div className="bg-bg-secondary border border-border hover:border-amber-500/40 rounded-xl p-5 transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
              In-Flight Tickets
            </span>
            {/* <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-sm font-semibold">
              ⚡
            </span> */}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400">
              {stats.totalOpen + stats.totalInProgress}
            </div>
            <div className="text-xs text-text-muted mt-1 flex items-center gap-2">
              <span className="text-amber-300 font-medium">{stats.totalOpen} Open</span>
              <span>•</span>
              <span className="text-purple-300 font-medium">{stats.totalInProgress} In Progress</span>
            </div>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-bg-secondary border border-border hover:border-emerald-500/40 rounded-xl p-5 transition flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-text-muted">
              Resolved Tickets
            </span>
            {/* <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-semibold">
              ✅
            </span> */}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {stats.totalResolved}
            </div>
            <div className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{stats.resolutionRate}%</span>
              <span>resolution rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut Distribution Chart */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Ticket Distribution
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Proportion of active issues by status
              </p>
            </div>
            <span className="text-xs font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded border border-border">
              {stats.totalTickets} total
            </span>
          </div>

          {/* SVG Donut */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
                {/* Background Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  className="stroke-bg-tertiary"
                  strokeWidth="14"
                  fill="transparent"
                />

                {ringSegments ? (
                  <>
                    {/* Resolved Segment (Emerald) */}
                    {stats.totalResolved > 0 && (
                      <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#10b981"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={ringSegments.resolved.dasharray}
                        strokeDashoffset={ringSegments.resolved.dashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    )}

                    {/* In Progress Segment (Purple) */}
                    {stats.totalInProgress > 0 && (
                      <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#a855f7"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={ringSegments.inProgress.dasharray}
                        strokeDashoffset={ringSegments.inProgress.dashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    )}

                    {/* Open Segment (Amber) */}
                    {stats.totalOpen > 0 && (
                      <circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#f59e0b"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={ringSegments.open.dasharray}
                        strokeDashoffset={ringSegments.open.dashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    )}
                  </>
                ) : null}
              </svg>

              {/* Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                  {stats.totalTickets}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
                  Total Tickets
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/70 text-center">
              <div className="p-2 rounded-lg bg-bg-tertiary/40">
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Open</span>
                </div>
                <div className="text-sm font-bold text-text-primary">
                  {stats.totalOpen}
                </div>
                <div className="text-[10px] text-text-muted">
                  {stats.totalTickets > 0
                    ? `${Math.round((stats.totalOpen / stats.totalTickets) * 100)}%`
                    : "0%"}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-bg-tertiary/40">
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Progress</span>
                </div>
                <div className="text-sm font-bold text-text-primary">
                  {stats.totalInProgress}
                </div>
                <div className="text-[10px] text-text-muted">
                  {stats.totalTickets > 0
                    ? `${Math.round((stats.totalInProgress / stats.totalTickets) * 100)}%`
                    : "0%"}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-bg-tertiary/40">
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Resolved</span>
                </div>
                <div className="text-sm font-bold text-text-primary">
                  {stats.totalResolved}
                </div>
                <div className="text-[10px] text-text-muted">
                  {stats.totalTickets > 0
                    ? `${Math.round((stats.totalResolved / stats.totalTickets) * 100)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Project Health & Progress Bars (2 columns) */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Project Health & Progress
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Resolution progress and ticket load per project
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {allProjects.length} active project{allProjects.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Spinner />
              </div>
            ) : allProjects.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-sm border border-dashed border-border/70 rounded-xl">
                No active projects found in your workspaces.
              </div>
            ) : (
              allProjects.slice(0, 5).map((proj) => {
                const open = Number(proj.counts?.open) || 0;
                const inProgress = Number(proj.counts?.in_progress) || 0;
                const resolved = Number(proj.counts?.resolved) || 0;
                const total = open + inProgress + resolved;
                const pctResolved = total > 0 ? Math.round((resolved / total) * 100) : 0;
                const pctOpen = total > 0 ? (open / total) * 100 : 0;
                const pctProgress = total > 0 ? (inProgress / total) * 100 : 0;

                return (
                  <div
                    key={proj.id}
                    className="p-3.5 bg-bg-tertiary/40 border border-border/60 hover:border-accent/40 rounded-xl transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orgs/${proj.org_id}/projects/${proj.id}`}
                          className="font-semibold text-sm text-text-primary hover:text-accent transition flex items-center gap-1.5"
                        >
                          <span>{proj.name}</span>
                          <span className="text-[11px] text-text-muted font-normal">
                            ({proj.orgName})
                          </span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-text-muted">
                          {resolved}/{total} resolved
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pctResolved === 100 && total > 0
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : pctResolved > 0
                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                : "bg-bg-tertiary text-text-muted border border-border"
                            }`}
                        >
                          {pctResolved}%
                        </span>
                      </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden flex border border-border/50">
                      {total === 0 ? (
                        <div className="h-full w-full bg-bg-tertiary/60" />
                      ) : (
                        <>
                          <div
                            style={{ width: `${pctResolved}%` }}
                            className="h-full bg-emerald-500 transition-all duration-500"
                            title={`${resolved} Resolved (${pctResolved}%)`}
                          />
                          <div
                            style={{ width: `${pctProgress}%` }}
                            className="h-full bg-purple-500 transition-all duration-500"
                            title={`${inProgress} In Progress (${Math.round(pctProgress)}%)`}
                          />
                          <div
                            style={{ width: `${pctOpen}%` }}
                            className="h-full bg-amber-500 transition-all duration-500"
                            title={`${open} Open (${Math.round(pctOpen)}%)`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Your Workspaces Section */}
      {/* <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Your Workspaces
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select an organization to access its boards, tickets, and team members
            </p>
          </div>
          <span className="text-xs text-text-muted font-mono bg-bg-secondary px-2.5 py-1 rounded-md border border-border">
            {organizations.length} workspace{organizations.length === 1 ? "" : "s"}
          </span>
        </div>

        {organizations.length === 0 ? (
          <div className="p-8 text-center text-text-muted bg-bg-secondary border border-border rounded-xl">
            You do not belong to any organizations yet. Use the sidebar to create one or accept an invitation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => {
              const orgProjects = allProjects.filter((p) => p.org_id === org.id);
              const orgTickets = orgProjects.reduce(
                (sum, p) =>
                  sum +
                  (Number(p.counts?.open) || 0) +
                  (Number(p.counts?.in_progress) || 0) +
                  (Number(p.counts?.resolved) || 0),
                0
              );

              return (
                <div
                  key={org.id}
                  onClick={() => switchOrg(org.id)}
                  className="bg-bg-secondary border border-border hover:border-accent/40 rounded-xl p-5 cursor-pointer transition flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-text-primary text-base group-hover:text-accent transition truncate pr-2">
                        {org.name}
                      </span>
                      <span className="text-[11px] font-mono capitalize px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold shrink-0">
                        {org.role}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted font-mono mb-4">
                      slug: {org.slug}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-text-muted">
                      <span>{orgProjects.length} projects</span>
                      <span>•</span>
                      <span>{orgTickets} tickets</span>
                    </div>
                    <span className="text-accent font-medium group-hover:translate-x-0.5 transition transform flex items-center gap-1">
                      <span>Open</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div> */}
    </div>
  );
}
