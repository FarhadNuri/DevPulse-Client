import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./hooks";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IssuesPage from "./pages/IssuesPage";
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen flex flex-col text-base">
      <Routes>
        <Route path="/" element={<IssuesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
