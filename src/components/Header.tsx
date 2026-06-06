import { useAuth } from "../hooks";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="bg-bg-secondary border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">
            <span className="text-accent">Dev</span>Pulse
          </h1>
        </div>
        {isLoggedIn && user ? (
          <div className="flex items-center gap-3">
            <span className="text-base text-text-secondary hidden sm:inline">{user.name}</span>
            <span className="text-sm font-mono bg-bg-tertiary text-text-secondary rounded px-2 py-0.5">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-base font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-md border border-red-500/30 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-base font-medium bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent-hover px-4 py-2 rounded-md border border-accent/30 transition cursor-pointer"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
