export type OrgRole = "owner" | "admin" | "member" | "guest";
export type ProjectRole = "contributor" | "client";
export type ProjectAccessStatus =
  | "full"
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export type Role = OrgRole | ProjectRole | "maintainer";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface User {
  id: number;
  name: string;
  email: string;
  is_super_admin?: boolean;
  status?: "active" | "disabled";
  role?: string;
}

export interface OrgSummary {
  id: number;
  name: string;
  slug: string;
  role: OrgRole;
  status: "active" | "suspended";
}

export interface AuthResponse {
  token: string;
  user: User;
  joined?: {
    org: OrgSummary;
    project_id: number | null;
  };
}

export interface PublicInvitation {
  email: string;
  role: OrgRole | ProjectRole;
  org: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  } | null;
  invited_by_name: string;
  user_exists: boolean;
}

export interface Invitation {
  id: number;
  org_id: number;
  project_id: number | null;
  email: string;
  role: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
  invited_by: number;
  resend_count?: number;
}

export interface OrgMember {
  id?: number;
  org_id?: number;
  user_id: number;
  role: OrgRole;
  created_at?: string;
  joined_at?: string;
  name: string;
  email: string;
}

export interface AcceptInvitationResponse {
  org: OrgSummary;
  project_id: number | null;
}

export interface MyPendingInvitation {
  id: number;
  org_id: number;
  org_name: string;
  project_id: number | null;
  project_name: string | null;
  role: string;
  invited_by_name: string;
  expires_at: string;
  created_at: string;
}

export interface AuthMeResponse {
  user: User;
  organizations: OrgSummary[];
}

export interface Project {
  id: number;
  org_id: number;
  name: string;
  description?: string | null;
  archived?: boolean;
  created_at: string;
  access_status: ProjectAccessStatus;
  my_project_role?: ProjectRole | null;
  counts?: {
    open: number;
    in_progress: number;
    resolved: number;
  };
}

export interface ProjectMember {
  id: number;
  user_id?: number;
  name?: string;
  email?: string;
  role: ProjectRole;
  status: string;
  requested_at?: string;
  decided_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProjectAccessRequest {
  id: number;
  project_id?: number;
  user_id?: number;
  requester_name?: string;
  requester_email?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  role: ProjectRole;
  status: string;
  requested_at: string;
}

export interface Label {
  id: number;
  org_id?: number;
  name: string;
  color: string;
  created_at?: string;
}

export interface Attachment {
  id: number;
  issue_id: number;
  uploaded_by: number;
  url: string;
  public_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  uploader?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface MentionableUser {
  id: number;
  name: string;
  email: string;
}

export interface Issue {
  id: number;
  project_id: number;
  project_name?: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: {
    id: number;
    name: string;
    email?: string;
    role?: string;
  };
  assignee?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  labels?: Label[];
  attachments?: Attachment[];
  comment_count?: number;
  created_at: string;
  updated_at: string;
  approval_status?: ApprovalStatus;
  rejection_reason?: string | null;
  app_name?: string | null;
  approved_by?: number;
  approved_at?: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
  app_name?: string;
  assigneeId?: number | null;
  labelIds?: number[];
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  assigneeId?: number | null;
  labelIds?: number[];
}

export interface ApprovalAction {
  action: "approved" | "rejected";
  reason?: string;
}

export interface Comment {
  id: number;
  issue_id: number;
  body: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    email?: string;
    role?: string;
  };
  mentions?: {
    id: number;
    name: string;
  }[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ActivityEntry {
  id: number;
  org_id: number;
  project_id: number | null;
  issue_id: number | null;
  actor_id: number;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
  actor: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginatedActivityResponse {
  items: ActivityEntry[];
  next_cursor: number | null;
}

export interface AdminStats {
  users: number;
  organizations: number;
  projects: number;
  issues: number;
  pending_issues: number;
  signups_last_7_days: number;
  active_orgs_last_7_days: number;
}

export interface AdminOrg {
  id: number;
  name: string;
  slug: string;
  status: "active" | "suspended";
  owner: {
    id: number;
    name: string;
    email: string;
  };
  member_count: number;
  project_count: number;
  issue_count: number;
  created_at: string;
}

export interface AdminOrgDetail {
  org: {
    id: number;
    name: string;
    slug: string;
    status: "active" | "suspended";
    created_at: string;
  };
  members: {
    id: number;
    name: string;
    email: string;
    role: OrgRole;
  }[];
  projects: {
    id: number;
    name: string;
    archived_at: string | null;
  }[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "disabled";
  is_super_admin: boolean;
  org_count: number;
  created_at: string;
}

export interface AdminUserDetail {
  user: {
    id: number;
    name: string;
    email: string;
    status: "active" | "disabled";
    is_super_admin: boolean;
    created_at: string;
  };
  organizations: {
    id: number;
    name: string;
    slug: string;
    role: OrgRole;
  }[];
}

export interface AdminProject {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  org_id: number;
  org_name: string;
  org_slug: string;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  member_count: number;
}

export interface AdminIssue {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  approval_status: string;
  rejection_reason: string | null;
  created_at: string;
  project_id: number;
  project_name: string;
  org_id: number;
  org_name: string;
  reporter: {
    id: number;
    name: string;
    email: string;
  } | null;
}

