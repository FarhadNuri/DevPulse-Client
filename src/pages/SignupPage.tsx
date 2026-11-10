import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api";
import { useAuth } from "../hooks";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithToken, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading && isLoggedIn) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.signup({ name: name.trim(), email: email.trim(), password });
      // Automatically log the new user in
      const loginRes = await auth.login({ email: email.trim(), password });
      const meData = await loginWithToken(loginRes.token);

      toast.success("Account created");
      if (!meData.organizations || meData.organizations.length === 0) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate(`/orgs/${meData.organizations[0].id}/projects`, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
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
          <h2 className="text-xl md:text-2xl font-semibold text-text-primary">Create account</h2>
          {error && (
            <div className="text-sm md:text-base text-red-400 bg-red-400/10 rounded-md px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm md:text-base text-text-secondary mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 md:px-4 md:py-3.5 text-base md:text-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
              placeholder="Jane Doe"
            />
          </div>
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
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-sm md:text-base text-text-secondary text-center">
            Have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-hover transition">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
