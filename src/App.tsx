import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InviteAcceptPage from "./pages/InviteAcceptPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProjectsGridPage from "./pages/ProjectsGridPage";
import IssuesPage from "./pages/IssuesPage";
import OrgSettingsPage from "./pages/OrgSettingsPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import SuperAdminRoute from "./components/admin/SuperAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrgsPage from "./pages/admin/AdminOrgsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import OrgRoute from "./components/OrgRoute";
import AppLayout from "./components/AppLayout";
import Spinner from "./components/Spinner";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-10 bg-black min-h-screen text-xl">
          {this.state.error?.toString()}
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}


function AppContent() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/invite/:token" element={<InviteAcceptPage />} />

        {/* Global Dashboard / Onboarding inside AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/onboarding" element={<DashboardPage />} />
        </Route>

        {/* Super Admin Console */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orgs" element={<AdminOrgsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route
          path="/orgs/:orgId"
          element={
            <ProtectedRoute>
              <OrgRoute />
            </ProtectedRoute>
          }
        >
          <Route element={<AppLayout />}>
            <Route path="projects" element={<ProjectsGridPage />} />
            <Route path="projects/:projectId" element={<IssuesPage />} />
            <Route path="my-requests" element={<MyRequestsPage />} />
            <Route path="settings" element={<OrgSettingsPage />} />
          </Route>
        </Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <ConfirmProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  color: "#f5f5f5",
                  border: "1px solid #2e2e2e",
                  fontSize: "14px",
                },
              }}
            />
          </ConfirmProvider>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
