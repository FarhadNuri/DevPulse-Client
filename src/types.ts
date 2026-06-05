export type Role = "contributor" | "maintainer";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: User;
  createdAt: string;
  updatedAt: string;
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
