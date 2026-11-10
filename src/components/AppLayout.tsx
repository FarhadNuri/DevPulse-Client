import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, useOrg } from "../hooks";
import CreateOrgModal from "./CreateOrgModal";
import Logo from "./Logo";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const {
    currentOrg,
    organizations,
    switchOrg,
    setViewingOrg,
    isMaintainer,
    createOrgModalOpen,
    setCreateOrgModalOpen,
  } = useOrg();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleExitOrgView() {
    setViewingOrg(null);
    try {
      localStorage.removeItem("devpulse_last_org");
    } catch {
      // Ignore
    }
    navigate("/admin/orgs", { replace: true });
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-bg-primary flex flex-col md:flex-row text-text-primary">
      {/* Mobile Top Navbar with Hamburger */}
      <header className="md:hidden h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4 shrink-0 z-30">
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="p-2 -mr-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Off-canvas on mobile, fixed column on desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 h-full bg-bg-secondary border-r border-border flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto flex-1 pr-1 pb-4">
          {/* Logo & Mobile Close Button */}
          <div className="mb-6 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="hover:opacity-90 transition cursor-pointer"
              >
                <Logo size="md" />
              </Link>
              {/* Close button visible only on mobile */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition cursor-pointer"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {user?.is_super_admin && (
              <div className="mt-2.5 flex items-center">
                <span className="text-[10px] uppercase font-mono tracking-wider bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded font-semibold">
                  Super Admin
                </span>
              </div>
            )}
          </div>

          {/* Org Switcher */}
          <div>
            <div className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-2 px-2">
              Organizations
            </div>
            <div className="space-y-1">
              {organizations.length > 0 ? (
                organizations.map((org) => {
                  const isActive = currentOrg?.id === org.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrg(org.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
                        isActive
                          ? "bg-accent/15 text-accent font-medium border border-accent/30"
                          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      }`}
                    >
                      <span className="truncate pr-2">{org.name}</span>
                      <span className="text-[11px] font-mono capitalize bg-bg-tertiary text-text-muted px-1.5 py-0.5 rounded border border-border/40">
                        {org.role}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-text-muted px-2 py-1.5 italic">
                  {user?.is_super_admin ? "Admin Inspection" : "No organizations yet"}
                </div>
              )}
            </div>

            {/* Create Org Button (Hidden for Super Admin) */}
            {!user?.is_super_admin && (
              <button
                onClick={() => {
                  setCreateOrgModalOpen(true);
                  setMobileOpen(false);
                }}
                className="w-full mt-3 flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-text-muted hover:text-accent hover:bg-bg-tertiary transition cursor-pointer border border-dashed border-border hover:border-accent/40"
              >
                <span>+</span>
                <span>Create organization</span>
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-2 px-2">
              Navigation
            </div>
            <div className="space-y-1">
              {user?.is_super_admin ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleExitOrgView();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-accent bg-accent/15 hover:bg-accent/25 border border-accent/30 font-medium transition text-left cursor-pointer shadow-sm"
                >
                  <span className="text-xs font-bold">←</span>
                  <span>Exit to Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
                    location.pathname === "/dashboard" || location.pathname === "/onboarding"
                      ? "bg-bg-tertiary text-text-primary font-medium border border-border/50"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  }`}
                >
                  <span>Dashboard</span>
                </button>
              )}

              {currentOrg && (
                <>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(`/orgs/${currentOrg.id}/projects`);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
                      location.pathname.includes("/projects")
                        ? "bg-bg-tertiary text-text-primary font-medium border border-border/50"
                        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    }`}
                  >
                    <span>Projects</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(`/orgs/${currentOrg.id}/my-requests`);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
                      location.pathname.includes("/my-requests")
                        ? "bg-bg-tertiary text-text-primary font-medium border border-border/50"
                        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    }`}
                  >
                    <span>My Requests</span>
                  </button>
                  {isMaintainer && (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate(`/orgs/${currentOrg.id}/settings`);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
                        location.pathname.includes("/settings")
                          ? "bg-bg-tertiary text-text-primary font-medium border border-border/50"
                          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      }`}
                    >
                      <span>Org Settings</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Info & Logout (Always fixed at bottom) */}
        <div className="pt-4 mt-auto border-t border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-sm font-medium text-text-primary truncate">
                {user?.name}
              </div>
              <div className="text-xs text-text-muted truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded border border-red-500/30 transition cursor-pointer flex-shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-3.5rem)] md:h-full overflow-y-auto flex flex-col min-w-0">
        {user?.is_super_admin &&
          currentOrg &&
          !organizations.some((o) => o.id === currentOrg.id) && (
            <div className="bg-bg-secondary/90 border-b border-accent/25 px-6 py-2.5 text-xs text-text-secondary flex items-center shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span>
                  You are viewing <span className="font-semibold text-text-primary">{currentOrg.name}</span> in inspection mode. Actions are logged.
                </span>
              </div>
            </div>
          )}
        <Outlet />
      </main>

      <CreateOrgModal
        open={createOrgModalOpen}
        onClose={() => setCreateOrgModalOpen(false)}
      />
    </div>
  );
}
