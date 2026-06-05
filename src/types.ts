export type Role = "contributor" | "maintainer";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

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
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}
