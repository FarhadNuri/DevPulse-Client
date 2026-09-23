import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React from "react";
import { AuthProvider, useAuth } from "./hooks";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IssuesPage from "./pages/IssuesPage";
import ProjectsGridPage from "./pages/ProjectsGridPage";
import Footer from "./components/Footer";

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-10 bg-black min-h-screen text-xl">{this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-primary">Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen flex flex-col text-base">
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsGridPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#f5f5f5",
              border: "1px solid #2e2e2e",
              fontSize: "16px",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
