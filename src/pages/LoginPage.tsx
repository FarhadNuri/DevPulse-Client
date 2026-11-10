import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api";
import { useAuth } from "../hooks";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithToken, isLoggedIn, isLoading, organizations } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && isLoggedIn) {
    if (!organizations || organizations.length === 0) {
      navigate("/dashboard", { replace: true });
    } else {
      let targetOrgId = organizations[0].id;
      try {
        const saved = localStorage.getItem("devpulse_last_org");
        if (saved && organizations.some((o) => o.id === Number(saved))) {
          targetOrgId = Number(saved);
        }
      } catch {
        // Ignore localStorage error
      }
      navigate(`/orgs/${targetOrgId}/projects`, { replace: true });
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await auth.login({ email: email.trim(), password });
      // Call GET /auth/me via loginWithToken to load user profile and organizations
      const meData = await loginWithToken(res.token);

      toast.success("Logged in");

      if (meData.user?.is_super_admin) {
        navigate("/admin", { replace: true });
        return;
      }

      if (!meData.organizations || meData.organizations.length === 0) {
        navigate("/dashboard", { replace: true });
      } else {
        let targetOrgId = meData.organizations[0].id;
        try {
          const saved = localStorage.getItem("devpulse_last_org");
          if (saved && meData.organizations.some((o) => o.id === Number(saved))) {
            targetOrgId = Number(saved);
          }
        } catch {
          // Ignore localStorage error
        }
        navigate(`/orgs/${targetOrgId}/projects`, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <div className="flex justify-center mb-8 md:mb-10">
          <Link
            to="/"
            className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-xl transition hover:opacity-90 active:scale-[0.98]"
            aria-label="DevPulse Home"
          >
            <Logo size="lg" />
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary border border-border rounded-lg p-6 md:p-8 lg:p-10 space-y-5 md:space-y-6"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-text-primary">Sign in</h2>
          {error && (
            <div className="text-sm md:text-base text-red-400 bg-red-400/10 rounded-md px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm md:text-base text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 md:px-4 md:py-3.5 text-base md:text-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 md:px-4 md:py-3.5 text-base md:text-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-accent hover:bg-accent-hover text-white font-medium text-base md:text-lg rounded-md py-3 md:py-3.5 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-sm md:text-base text-text-secondary text-center">
            No account?{" "}
            <Link to="/signup" className="text-accent hover:text-accent-hover transition">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
