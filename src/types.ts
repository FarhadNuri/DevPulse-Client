export type Role = "contributor" | "maintainer" | "client";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: User;
  created_at: string;
  updated_at: string;
  approval_status?: ApprovalStatus;
  app_name?: string;
  approved_by?: number;
  approved_at?: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
  app_name?: string;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface ApprovalAction {
  action: "approved" | "rejected";
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
    role: Role;
  };
}
