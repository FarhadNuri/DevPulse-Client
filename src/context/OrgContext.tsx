import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { OrgRole, OrgSummary } from "../types";

interface OrgContextState {
  currentOrg: OrgSummary | null;
  organizations: OrgSummary[];
  currentRole: OrgRole | null;
  isMaintainer: boolean;
  isOwner: boolean;
  isMember: boolean;
  isGuest: boolean;
  switchOrg: (orgId: number) => void;
  setCurrentOrgById: (orgId: number) => boolean;
  setViewingOrg: (org: OrgSummary | null) => void;
  createOrgModalOpen: boolean;
  setCreateOrgModalOpen: (open: boolean) => void;
}

const OrgContext = createContext<OrgContextState | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user, organizations } = useAuth();
  const navigate = useNavigate();
  const [currentOrg, setCurrentOrg] = useState<OrgSummary | null>(null);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);

  // Sync currentOrg when organizations list updates
  useEffect(() => {
    // If super admin is viewing an org, keep it
    if (currentOrg) {
      const match = organizations.find((o) => o.id === currentOrg.id);
      if (match) {
        setCurrentOrg(match);
        return;
      }
      if (user?.is_super_admin) {
        return;
      }
    }

    if (organizations.length === 0) {
      if (!user?.is_super_admin) {
        setCurrentOrg(null);
      }
      return;
    }

    // Try last used org from localStorage
    let lastOrgId: number | null = null;
    try {
      const saved = localStorage.getItem("devpulse_last_org");
      if (saved) lastOrgId = Number(saved);
    } catch {
      // Ignore storage errors
    }

    if (lastOrgId) {
      const match = organizations.find((o) => o.id === lastOrgId);
      if (match) {
        setCurrentOrg(match);
        return;
      }
    }

    // Default to first org
    if (organizations.length > 0) {
      setCurrentOrg(organizations[0]);
    }
  }, [organizations, currentOrg, user?.is_super_admin]);

  const switchOrg = useCallback(
    (orgId: number) => {
      const target = organizations.find((o) => o.id === orgId);
      if (!target) return;
      setCurrentOrg(target);
      try {
        localStorage.setItem("devpulse_last_org", String(orgId));
      } catch {
        // Ignore storage errors
      }
      navigate(`/orgs/${orgId}/projects`);
    },
    [organizations, navigate],
  );

  const setCurrentOrgById = useCallback(
    (orgId: number): boolean => {
      const target = organizations.find((o) => o.id === orgId);
      if (!target) return false;
      setCurrentOrg((prev) => {
        if (!prev || prev.id !== target.id) {
          try {
            localStorage.setItem("devpulse_last_org", String(orgId));
          } catch {
            // Ignore storage errors
          }
          return target;
        }
        return prev;
      });
      return true;
    },
    [organizations],
  );

  const setViewingOrg = useCallback((org: OrgSummary | null) => {
    if (!org) {
      setCurrentOrg(null);
      try {
        localStorage.removeItem("devpulse_last_org");
      } catch {
        // Ignore storage errors
      }
      return;
    }
    setCurrentOrg((prev) => {
      if (prev?.id === org.id && prev?.name === org.name && prev?.status === org.status) {
        return prev;
      }
      return org;
    });
  }, []);

  const currentRole = currentOrg?.role || null;
  const isMaintainer =
    currentRole === "owner" ||
    currentRole === "admin" ||
    !!user?.is_super_admin;
  const isOwner = currentRole === "owner" || !!user?.is_super_admin;
  const isMember = currentRole === "member";
  const isGuest = currentRole === "guest";

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        organizations,
        currentRole,
        isMaintainer,
        isOwner,
        isMember,
        isGuest,
        switchOrg,
        setCurrentOrgById,
        setViewingOrg,
        createOrgModalOpen,
        setCreateOrgModalOpen,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
