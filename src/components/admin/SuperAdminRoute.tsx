import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks";
import Spinner from "../Spinner";

export default function SuperAdminRoute() {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_super_admin) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Access Forbidden
          </h2>
          <p className="text-text-muted text-sm mb-6">
            You must be a platform super administrator to access this console.
          </p>
          <a
            href="/"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

