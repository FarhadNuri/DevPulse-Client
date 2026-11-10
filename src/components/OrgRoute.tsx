import { useEffect, useState } from "react";
import { useParams, Link, Outlet } from "react-router-dom";
import { useAuth, useOrg } from "../hooks";
import { orgs } from "../api";
import Spinner from "./Spinner";

export default function OrgRoute() {
  const { orgId } = useParams<{ orgId: string }>();
  const { organizations, isLoading: authLoading, user } = useAuth();
  const { currentOrg, setCurrentOrgById, setViewingOrg } = useOrg();
  const [adminOrgLoading, setAdminOrgLoading] = useState(false);
  const [adminOrgFailed, setAdminOrgFailed] = useState(false);

  const numOrgId = Number(orgId);
  const isValid = !isNaN(numOrgId) && numOrgId > 0;
  const isDirectMember = isValid && organizations.some((o) => o.id === numOrgId);
  const isSuperAdmin = !!user?.is_super_admin;

  useEffect(() => {
    if (authLoading || !isValid) return;

    if (isDirectMember) {
      if (currentOrg?.id !== numOrgId) {
        setCurrentOrgById(numOrgId);
      }
    } else if (isSuperAdmin) {
      if (currentOrg?.id === numOrgId) {
        setAdminOrgLoading(false);
        return;
      }

      let active = true;
      setAdminOrgLoading(true);
      orgs
        .get(numOrgId)
        .then((data) => {
          if (!active) return;
          if (data) {
            setViewingOrg({
              id: data.id,
              name: data.name,
              slug: data.slug,
              role: "owner",
              status: data.status,
            });
            setAdminOrgFailed(false);
          } else {
            setAdminOrgFailed(true);
          }
        })
        .catch(() => {
          if (!active) return;
          setAdminOrgFailed(true);
        })
        .finally(() => {
          if (!active) return;
          setAdminOrgLoading(false);
        });

      return () => {
        active = false;
      };
    }
  }, [authLoading, isDirectMember, isSuperAdmin, isValid, numOrgId, currentOrg?.id, setCurrentOrgById, setViewingOrg]);

  useEffect(() => {
    return () => {
      // Clear viewing org when leaving OrgRoute so it does not persist in super admin's session
      if (isSuperAdmin && !isDirectMember) {
        setViewingOrg(null);
      }
    };
  }, [isSuperAdmin, isDirectMember, setViewingOrg]);

  if (authLoading || (adminOrgLoading && currentOrg?.id !== numOrgId)) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const hasAccess =
    isValid &&
    (isDirectMember ||
      (isSuperAdmin && (!adminOrgFailed || currentOrg?.id === numOrgId)));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-text-primary mb-3">404</h1>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Organization Not Found
          </h2>
          <p className="text-text-muted text-sm mb-6">
            You do not have access to this organization or it does not exist.
          </p>
          <Link
            to="/"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            Go to My Organizations
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

