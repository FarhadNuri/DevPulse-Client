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
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-primary">
            <span className="text-accent">Dev</span>Pulse
          </h1>
        </div>
        {isLoggedIn && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary hidden sm:inline">{user.name}</span>
            <span className="text-xs font-mono bg-bg-tertiary text-text-secondary rounded px-2 py-0.5">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-text-muted hover:text-text-primary transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-accent hover:text-accent-hover transition"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
