import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { invitations as invitationsApi, auth } from "../api";
import { useAuth } from "../hooks";
import type { PublicInvitation } from "../types";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn, loginWithToken, logout, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invite, setInvite] = useState<PublicInvitation | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch invitation details on mount or when token changes
  useEffect(() => {
    if (!token) {
      setInviteError("No invitation token provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    invitationsApi
      .getPublic(token)
      .then((data) => {
        if (!isMounted) return;
        setInvite(data);
        setInviteError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setInviteError(
          err instanceof Error
            ? err.message
            : "This invitation is expired, revoked, or invalid."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Helper to handle post-accept navigation
  function navigateToDestination(orgId: number, projectId: number | null) {
    try {
      localStorage.setItem("devpulse_last_org", String(orgId));
    } catch {
      // Ignore storage errors
    }
    if (projectId) {
      navigate(`/orgs/${orgId}/projects/${projectId}`, { replace: true });
    } else {
      navigate(`/orgs/${orgId}/projects`, { replace: true });
    }
  }

  // Action: Logged in user with matching email accepts invite
  async function handleAcceptLoggedIn() {
    if (!token || !invite) return;
    setSubmitting(true);
    setFormError("");

    try {
      const res = await invitationsApi.accept(token);
      await refreshMe();
      toast.success(`Joined ${invite.org.name}!`);
      navigateToDestination(res.org.id, res.project_id);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to accept invitation"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Action: Existing user logs in and accepts invite
  async function handleLoginAndAccept(e: FormEvent) {
    e.preventDefault();
    if (!token || !invite) return;
    setSubmitting(true);
    setFormError("");

    try {
      // 1. Authenticate
      const loginRes = await auth.login({
        email: invite.email,
        password,
      });

      // 2. Set token in context
      await loginWithToken(loginRes.token);

      // 3. Accept invitation
      const acceptRes = await invitationsApi.accept(token);
      await refreshMe();

      toast.success(`Welcome back! Joined ${invite.org.name}.`);
      navigateToDestination(acceptRes.org.id, acceptRes.project_id);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Login or acceptance failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Action: New user signs up and accepts invite
  async function handleSignupAndAccept(e: FormEvent) {
    e.preventDefault();
    if (!token || !invite) return;
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      // Backend automatically joins org and project when inviteToken is provided
      const signupRes = await auth.signup({
        name: name.trim(),
        email: invite.email,
        password,
        inviteToken: token,
      });

      // Store token and populate user session
      await loginWithToken(signupRes.token);

      toast.success(`Account created! Joined ${invite.org.name}.`);

      const orgId = signupRes.joined?.org.id || invite.org.id;
      const projectId =
        signupRes.joined?.project_id !== undefined
          ? signupRes.joined.project_id
          : invite.project?.id || null;

      navigateToDestination(orgId, projectId);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Signup failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // 2. Invalid or Expired Invitation
  if (inviteError || !invite) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-8 text-center shadow-lg">
          <div className="w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ✕
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Invitation Expired or Invalid
          </h1>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {inviteError ||
              "This invitation link is invalid, has expired, or was already revoked."}
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-block w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-4 rounded-lg text-sm transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invitation Header Text Helper
  const invitationHeadline = invite.project ? (
    <span>
      Join <span className="text-text-primary font-bold">{invite.org.name}</span>{" "}
      as a client of{" "}
      <span className="text-accent font-semibold">{invite.project.name}</span>
    </span>
  ) : (
    <span>
      Join <span className="text-text-primary font-bold">{invite.org.name}</span>{" "}
      as <span className="text-accent font-semibold capitalize">{invite.role}</span>
    </span>
  );

  // Check email match if currently logged in
  const isEmailMismatch =
    isLoggedIn &&
    user &&
    user.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <h1 className="text-3xl font-bold text-text-primary text-center mb-8">
          <span className="text-accent">Dev</span>Pulse
        </h1>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-block bg-accent/15 text-accent border border-accent/30 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-1">
              Invitation
            </div>
            <h2 className="text-xl font-semibold text-text-secondary leading-snug">
              {invitationHeadline}
            </h2>
            <p className="text-xs text-text-muted">
              Invited by{" "}
              <span className="text-text-primary font-medium">
                {invite.invited_by_name}
              </span>
            </p>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="text-sm text-red-400 bg-red-400/10 rounded-md p-3">
              {formError}
            </div>
          )}

          {/* Scenario A: Logged in with DIFFERENT email */}
          {isEmailMismatch && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs space-y-2">
                <div className="font-semibold text-amber-300">
                  Account Mismatch
                </div>
                <p>
                  You are currently logged in as{" "}
                  <span className="font-mono text-text-primary">
                    {user?.email}
                  </span>
                  .
                </p>
                <p>
                  This invite was sent to{" "}
                  <span className="font-mono text-text-primary font-semibold">
                    {invite.email}
                  </span>
                  . Log out to continue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.success("Logged out");
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 py-2.5 px-4 rounded-lg text-sm font-medium border border-red-500/30 transition cursor-pointer"
              >
                Log Out to Accept Invite
              </button>
            </div>
          )}

          {/* Scenario B: Logged in with MATCHING email */}
          {isLoggedIn && !isEmailMismatch && (
            <div className="space-y-4 pt-2">
              <div className="text-xs text-text-muted text-center">
                Signed in as{" "}
                <span className="text-text-primary font-medium">
                  {user?.email}
                </span>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={handleAcceptLoggedIn}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submitting ? "Joining..." : `Accept & Join ${invite.org.name}`}
              </button>
            </div>
          )}

          {/* Scenario C: NOT logged in & user_exists = true -> Login Form */}
          {!isLoggedIn && invite.user_exists && (
            <form onSubmit={handleLoginAndAccept} className="space-y-4">
              <div className="text-xs text-text-muted text-center pb-1">
                You already have a DevPulse account. Log in to accept this
                invitation.
              </div>

              <div>
                <label className="block text-xs uppercase font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={invite.email}
                  readOnly
                  disabled
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium text-text-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  required
                  disabled={submitting}
                  className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !password}
                className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer pt-2"
              >
                {submitting
                  ? "Verifying & Joining..."
                  : `Log In & Join ${invite.org.name}`}
              </button>
            </form>
          )}

          {/* Scenario D: NOT logged in & user_exists = false -> Signup Form */}
          {!isLoggedIn && !invite.user_exists && (
            <form onSubmit={handleSignupAndAccept} className="space-y-4">
              <div className="text-xs text-text-muted text-center pb-1">
                Create your account to accept this invitation.
              </div>

              <div>
                <label className="block text-xs uppercase font-medium text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  disabled={submitting}
                  className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={invite.email}
                  readOnly
                  disabled
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium text-text-secondary mb-1">
                  Password (min 8 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  required
                  disabled={submitting}
                  className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !name.trim() || password.length < 8}
                className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer pt-2"
              >
                {submitting
                  ? "Creating Account..."
                  : `Create Account & Join ${invite.org.name}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

