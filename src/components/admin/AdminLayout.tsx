import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks";
import Logo from "../Logo";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isOverview = location.pathname === "/admin";
  const isOrgs = location.pathname.startsWith("/admin/orgs");
  const isUsers = location.pathname.startsWith("/admin/users");

  const getSectionTitle = () => {
    if (isOrgs) return "Organizations";
    if (isUsers) return "Users";
    return "Overview";
  };

  const navButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition text-left cursor-pointer ${
      isActive
        ? "bg-accent/15 text-accent font-medium border border-accent/30"
        : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
    }`;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-bg-primary flex flex-col md:flex-row text-text-primary">
      {/* Mobile Top Navbar with Hamburger */}
      <header className="md:hidden h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4 shrink-0 z-30">
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">
            Super Admin
          </span>
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
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar (Off-canvas on mobile, fixed column on desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 h-full bg-bg-secondary border-r border-border flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto flex-1 pr-1 pb-4">
          {/* Logo & Super Admin Badge */}
          <div className="mb-6 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setMobileOpen(false)} className="hover:opacity-90 transition cursor-pointer">
                <Logo size="md" />
              </Link>
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
            <div className="mt-2.5 flex items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-semibold">
                Super Admin
              </span>
            </div>
          </div>

          {/* Admin Navigation */}
          <div>
            <div className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-2 px-2">
              Admin Console
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin");
                }}
                className={navButtonClass(isOverview)}
              >
                <span>Overview</span>
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin/orgs");
                }}
                className={navButtonClass(isOrgs)}
              >
                <span>Organizations</span>
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin/users");
                }}
                className={navButtonClass(isUsers)}
              >
                <span>Users</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Info & Logout (Fixed at bottom left) */}
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
      <main className="flex-1 h-[calc(100vh-3.5rem)] md:h-full overflow-hidden flex flex-col min-w-0">
        {/* Top Navbar - Aligned with the containers below */}
        <header className="border-b border-border bg-bg-secondary/40 shrink-0 hidden md:block">
          <div className="max-w-7xl w-full mx-auto px-6 h-14 flex items-center justify-between">
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Admin Console</span>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-text-primary">
                {getSectionTitle()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Scroll Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
