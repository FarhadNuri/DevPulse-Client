import { useState, useEffect, type FormEvent } from "react";
import { issues, labels as labelsApi, projects as projectsApi, attachments as attachmentsApi, uploadToCloudinary } from "../api";
import { useAuth, useOrg } from "../hooks";
import type { IssueType, Label, ProjectMember } from "../types";
import toast from "react-hot-toast";
import Modal from "./Modal";
import AttachmentUploader from "./AttachmentUploader";

interface Props {
  open: boolean;
  orgId: number;
  projectId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewIssueModal({
  open,
  orgId,
  projectId,
  onClose,
  onCreated,
}: Props) {
  const { isLoggedIn } = useAuth();
  const { isGuest } = useOrg();
  const [appName, setAppName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("bug");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Candidates & labels for non-guests
  const [candidates, setCandidates] = useState<{ id: number; name: string }[]>([]);
  const [orgLabels, setOrgLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (!open || isGuest || !orgId || !projectId) return;

    // Load candidate members
    projectsApi.listMembers(orgId, projectId).then((mList: ProjectMember[]) => {
      const approved = (mList || [])
        .filter((m) => m.role === "contributor" && m.status === "approved")
        .map((m) => ({
          id: m.user?.id || m.user_id || m.id,
          name: m.user?.name || m.name || `User #${m.user_id || m.id}`,
        }));
      const map = new Map<number, { id: number; name: string }>();
      approved.forEach((c) => map.set(c.id, c));
      setCandidates(Array.from(map.values()));
    }).catch(() => {});

    // Load org labels
    labelsApi.list(orgId).then((res) => {
      setOrgLabels(res || []);
    }).catch(() => {});
  }, [open, isGuest, orgId, projectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    if (isGuest && !appName.trim()) {
      toast.error("App name is required");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        type,
      };

      if (isGuest) {
        payload.app_name = appName.trim();
      } else {
        if (assigneeId) {
          payload.assigneeId = Number(assigneeId);
        }
        if (selectedLabelIds.length > 0) {
          payload.labelIds = selectedLabelIds;
        }
      }

      const newIssue = await issues.create(orgId, projectId, payload);

      if (stagedFiles.length > 0 && newIssue && newIssue.id) {
        for (const file of stagedFiles) {
          try {
            const signResult = await attachmentsApi.sign(orgId, newIssue.id, {
              file_name: file.name,
              mime_type: file.type,
              size_bytes: file.size,
            });
            const uploaded = await uploadToCloudinary(signResult, file);
            await attachmentsApi.create(orgId, newIssue.id, {
              url: uploaded.url,
              public_id: uploaded.public_id,
              file_name: file.name,
              mime_type: file.type,
              size_bytes: file.size,
            });
          } catch (uploadErr) {
            console.error("Failed to upload screenshot attachment:", uploadErr);
          }
        }
      }

      toast.success(isGuest ? "Ticket submitted for approval" : "Issue created");
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setLoading(false);
    }
  }

  function toggleLabel(id: number) {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function reset() {
    setAppName("");
    setTitle("");
    setDescription("");
    setType("bug");
    setAssigneeId("");
    setSelectedLabelIds([]);
    setStagedFiles([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={isGuest ? "Submit Ticket" : "New Issue"}>
      {!isLoggedIn ? (
        <p className="text-sm text-text-secondary">You must be signed in to create issues.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isGuest && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                App Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
                placeholder="e.g. MyShopApp"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={5000}
              rows={4}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition resize-none"
              placeholder="Detailed description of the issue or feature (min 20 chars)"
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
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-border-focus transition cursor-pointer"
              >
                <option value="bug">Bug</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>

            {!isGuest && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-border-focus transition cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Labels for non-guests */}
          {!isGuest && orgLabels.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                Labels
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {orgLabels.map((lbl) => {
                  const isChecked = selectedLabelIds.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => toggleLabel(lbl.id)}
                      style={{
                        backgroundColor: isChecked ? `${lbl.color}25` : "transparent",
                        borderColor: isChecked ? lbl.color : "var(--color-border, #2e2e2e)",
                        color: isChecked ? lbl.color : "var(--color-text-secondary, #a1a1aa)",
                      }}
                      className="text-xs font-medium px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lbl.color }}
                      />
                      <span>{lbl.name}</span>
                      {isChecked && <span className="font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Screenshot Attachments */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
              Attachments (optional)
            </label>
            <AttachmentUploader
              orgId={orgId}
              stagedFiles={stagedFiles}
              onStagedFilesChange={setStagedFiles}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md py-2.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Creating..." : isGuest ? "Submit Ticket" : "Create Issue"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
