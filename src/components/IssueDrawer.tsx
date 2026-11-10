import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { issues as issuesApi } from "../api";
import { useOrg, useAuth } from "../hooks";
import type { Issue, IssueStatus, IssueType } from "../types";
import { formatDate, STATUS_LABELS, TYPE_LABELS } from "../utils";
import toast from "react-hot-toast";
import AssigneePicker from "./AssigneePicker";
import LabelPicker from "./LabelPicker";
import CommentSection from "./CommentSection";
import AttachmentUploader from "./AttachmentUploader";
import ActivityTimeline from "./ActivityTimeline";
import Spinner from "./Spinner";
import { getIssueActivity } from "../api";

interface IssueDrawerProps {
  orgId: number;
  projectId?: number;
  onIssueUpdated?: () => void;
}

export default function IssueDrawer({ orgId, projectId, onIssueUpdated }: IssueDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const issueIdParam = searchParams.get("issue");
  const issueId = issueIdParam ? Number(issueIdParam) : null;

  const { isMaintainer, isGuest } = useOrg();
  const { user, isLoggedIn } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("bug");
  const [status, setStatus] = useState<IssueStatus>("open");
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"comments" | "activity">("comments");

  const closeDrawer = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("issue");
    setSearchParams(next, { replace: true });
    setIssue(null);
    setIsEditing(false);
  }, [searchParams, setSearchParams]);

  const loadIssue = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await issuesApi.get(orgId, id);
      setIssue(data);
      setTitle(data.title);
      setDescription(data.description);
      setType(data.type);
      setStatus(data.status);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load issue details");
      closeDrawer();
    } finally {
      setLoading(false);
    }
  }, [orgId, closeDrawer]);

  useEffect(() => {
    if (issueId && !isNaN(issueId) && issueId > 0) {
      loadIssue(issueId);
    } else {
      setIssue(null);
    }
  }, [issueId, loadIssue]);

  if (!issueIdParam || !issueId) return null;

  const isReporter = issue?.reporter?.id === user?.id;
  const isPendingOrRejected =
    issue?.approval_status === "pending" || issue?.approval_status === "rejected";

  // Who can edit:
  // Maintainers & contributors can edit everything.
  // Clients can only edit their own issues while pending or rejected.
  const canEditFields = isMaintainer || (!isGuest && !issue?.approval_status) || (!isGuest) || (isGuest && isReporter && isPendingOrRejected);
  const canEditStatus = isMaintainer || !isGuest;
  const canEditAssigneeAndLabels = isMaintainer || !isGuest;

  async function handleQuickStatusChange(newStatus: IssueStatus) {
    if (!issue || !canEditStatus) return;
    try {
      const updated = await issuesApi.update(orgId, issue.id, { status: newStatus });
      setIssue(updated);
      setStatus(updated.status);
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      if (onIssueUpdated) onIssueUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleAssigneeChange(assigneeId: number | null) {
    if (!issue || !canEditAssigneeAndLabels) return;
    try {
      const updated = await issuesApi.update(orgId, issue.id, { assigneeId });
      setIssue(updated);
      toast.success(assigneeId ? "Assignee updated" : "Issue unassigned");
      if (onIssueUpdated) onIssueUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update assignee");
    }
  }

  async function handleLabelsChange(labelIds: number[]) {
    if (!issue || !canEditAssigneeAndLabels) return;
    try {
      const updated = await issuesApi.update(orgId, issue.id, { labelIds });
      setIssue(updated);
      toast.success("Labels updated");
      if (onIssueUpdated) onIssueUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update labels");
    }
  }

  async function handleSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!issue) return;

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle || !trimmedDesc) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: trimmedTitle,
        description: trimmedDesc,
        type,
      };
      if (canEditStatus) {
        payload.status = status;
      }

      const updated = await issuesApi.update(orgId, issue.id, payload);
      setIssue(updated);
      setIsEditing(false);
      toast.success("Issue details updated");
      if (onIssueUpdated) onIssueUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save issue details");
    } finally {
      setSaving(false);
    }
  }

  async function handleResubmit() {
    if (!issue || issue.approval_status !== "rejected") return;

    setResubmitting(true);
    try {
      const resubmitted = await issuesApi.resubmit(orgId, issue.id);
      setIssue(resubmitted);
      toast.success("Ticket resubmitted for approval!");
      if (onIssueUpdated) onIssueUpdated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resubmit ticket");
    } finally {
      setResubmitting(false);
    }
  }

  const effectiveProjectId = issue?.project_id || projectId || 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Background click dismiss */}
      <div className="flex-1 cursor-pointer" onClick={closeDrawer} />

      {/* Drawer Panel */}
      <div className="w-full max-w-2xl bg-bg-secondary border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-bg-secondary">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">Issue #{issueId}</span>
            {issue?.approval_status && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  issue.approval_status === "approved"
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : issue.approval_status === "rejected"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {issue.approval_status}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-md transition cursor-pointer text-sm"
            title="Close Drawer (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !issue ? (
            <div className="py-20 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {/* Rejection Alert Box */}
              {issue.approval_status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-red-400 text-lg leading-none">⚠️</span>
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-red-400 text-sm mb-1">
                        Ticket Rejected by Maintainer
                      </div>
                      <p className="text-text-secondary leading-relaxed whitespace-pre-wrap bg-bg-primary/50 p-2.5 rounded border border-red-500/20">
                        "{issue.rejection_reason || "No reason provided."}"
                      </p>
                    </div>
                  </div>

                  {(isReporter || isMaintainer) && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-red-500/20">
                      {!isEditing && canEditFields && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="text-xs bg-bg-tertiary hover:bg-bg-primary text-text-primary px-3 py-1.5 rounded border border-border transition cursor-pointer"
                        >
                          ✏️ Edit Ticket
                        </button>
                      )}
                      {isReporter && (
                        <button
                          type="button"
                          disabled={resubmitting}
                          onClick={handleResubmit}
                          className="text-xs bg-accent hover:bg-accent-hover text-white font-medium px-3.5 py-1.5 rounded transition disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {resubmitting ? "Resubmitting..." : "🔄 Resubmit Ticket"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Description Form or View */}
              {isEditing ? (
                <form onSubmit={handleSaveDetails} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={5}
                      maxLength={5000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                        Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as IssueType)}
                        className="w-full bg-bg-primary border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-focus"
                      >
                        <option value="bug">Bug</option>
                        <option value="feature_request">Feature Request</option>
                      </select>
                    </div>

                    {canEditStatus && (
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as IssueStatus)}
                          className="w-full bg-bg-primary border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-focus"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setTitle(issue.title);
                        setDescription(issue.description);
                        setType(issue.type);
                        setStatus(issue.status);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-4 py-1.5 rounded-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-text-primary leading-snug">
                      {issue.title}
                    </h2>
                    {canEditFields && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-accent hover:text-accent-hover font-medium shrink-0 bg-accent/10 px-2.5 py-1 rounded border border-accent/20 cursor-pointer transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed bg-bg-primary/40 p-3.5 rounded-lg border border-border/50">
                    {issue.description}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-bg-primary/60 p-4 rounded-lg border border-border">
                {/* Status */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-1.5">
                    Status
                  </div>
                  {canEditStatus ? (
                    <select
                      value={issue.status}
                      onChange={(e) => handleQuickStatusChange(e.target.value as IssueStatus)}
                      className="bg-bg-secondary border border-border rounded-md px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-bg-tertiary text-text-primary border border-border">
                      {STATUS_LABELS[issue.status] || issue.status}
                    </span>
                  )}
                </div>

                {/* Type */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-1.5">
                    Type
                  </div>
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${
                      issue.type === "bug"
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {TYPE_LABELS[issue.type] || issue.type}
                  </span>
                </div>

                {/* Assignee */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-1.5">
                    Assignee
                  </div>
                  <AssigneePicker
                    orgId={orgId}
                    projectId={effectiveProjectId}
                    currentAssignee={issue.assignee}
                    canEdit={canEditAssigneeAndLabels}
                    onAssigneeChange={handleAssigneeChange}
                  />
                </div>

                {/* Reporter */}
                <div>
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-1.5">
                    Reporter
                  </div>
                  <div className="text-xs text-text-primary font-medium truncate">
                    {issue.reporter?.name || "Unknown"}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {formatDate(issue.created_at)}
                  </div>
                </div>

                {/* Labels (Full row) */}
                <div className="col-span-2 pt-2 border-t border-border/50">
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-1.5">
                    Labels
                  </div>
                  <LabelPicker
                    orgId={orgId}
                    currentLabels={issue.labels}
                    canEdit={canEditAssigneeAndLabels}
                    onLabelsChange={handleLabelsChange}
                  />
                </div>

                {/* Attachments */}
                <div className="col-span-2 pt-3 border-t border-border/50">
                  <div className="text-[11px] font-semibold uppercase text-text-muted mb-2">
                    Attachments
                  </div>
                  <AttachmentUploader
                    orgId={orgId}
                    issueId={issue.id}
                    attachments={issue.attachments || []}
                    canUpload={isMaintainer || !isGuest || (isGuest && isReporter)}
                    currentUserId={user?.id}
                    isMaintainer={isMaintainer}
                    onAttachmentAdded={(newAtt) => {
                      setIssue((prev) =>
                        prev
                          ? {
                              ...prev,
                              attachments: [...(prev.attachments || []), newAtt],
                            }
                          : prev
                      );
                      if (onIssueUpdated) onIssueUpdated();
                    }}
                    onAttachmentDeleted={(attId) => {
                      setIssue((prev) =>
                        prev
                          ? {
                              ...prev,
                              attachments: (prev.attachments || []).filter((a) => a.id !== attId),
                            }
                          : prev
                      );
                      if (onIssueUpdated) onIssueUpdated();
                    }}
                  />
                </div>
              </div>

              {/* Comments & Activity Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-4 mb-4 border-b border-border text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("comments")}
                    className={`pb-2 transition cursor-pointer border-b-2 ${
                      activeBottomTab === "comments"
                        ? "border-accent text-text-primary font-semibold"
                        : "border-transparent text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Comments
                  </button>
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => setActiveBottomTab("activity")}
                      className={`pb-2 transition cursor-pointer border-b-2 ${
                        activeBottomTab === "activity"
                          ? "border-accent text-text-primary font-semibold"
                          : "border-transparent text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Activity
                    </button>
                  )}
                </div>

                {activeBottomTab === "comments" ? (
                  <CommentSection
                    orgId={orgId}
                    issueId={issue.id}
                    projectId={issue.project_id || projectId}
                    isLoggedIn={isLoggedIn}
                    currentUser={user}
                    alwaysExpanded={true}
                  />
                ) : (
                  <ActivityTimeline
                    key={`issue-activity-${issue.id}`}
                    fetchActivity={(before) => getIssueActivity(orgId, issue.id, { before, limit: 10 })}
                    currentIssueId={issue.id}
                    emptyMessage="No activity recorded on this issue yet."
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

