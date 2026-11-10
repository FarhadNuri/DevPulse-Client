import { useState, useEffect } from "react";
import type { Issue, Attachment } from "../types";
import { formatDate, TYPE_LABELS } from "../utils";

interface PendingIssueDetailsModalProps {
  open: boolean;
  issue: Issue | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onOpenReject: (issue: Issue) => void;
  processing?: boolean;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PendingIssueDetailsModal({
  open,
  issue,
  onClose,
  onApprove,
  onOpenReject,
  processing = false,
}: PendingIssueDetailsModalProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (previewAttachment) {
          setPreviewAttachment(null);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, previewAttachment]);

  if (!open || !issue) return null;

  const attachments: Attachment[] = issue.attachments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-bg-secondary border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-bg-primary flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {issue.app_name && (
                <span className="font-bold text-sm text-text-primary bg-bg-tertiary px-2 py-0.5 rounded border border-border">
                  {issue.app_name}
                </span>
              )}
              <span className="text-xs font-mono font-semibold text-text-muted bg-bg-tertiary px-2 py-0.5 rounded border border-border">
                #{issue.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Pending Approval
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Client Ticket
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  issue.type === "bug"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                }`}
              >
                {TYPE_LABELS[issue.type] ?? issue.type}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary pt-1">{issue.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md text-xl leading-none transition cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Reporter details */}
          <div className="flex items-center justify-between p-3.5 bg-bg-primary rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm border border-accent/30">
                {issue.reporter?.name?.charAt(0).toUpperCase() || "C"}
              </div>
              <div>
                <p className="text-xs text-text-muted">Reported by</p>
                <p className="text-sm font-semibold text-text-primary">
                  {issue.reporter?.name || "Client"}
                </p>
                {issue.reporter?.email && (
                  <p className="text-xs text-text-muted">{issue.reporter.email}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Submitted</p>
              <p className="text-xs font-medium text-text-secondary">
                {formatDate(issue.created_at)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-text-muted tracking-wider mb-2">
              Ticket Description
            </h3>
            <div className="p-4 bg-bg-primary rounded-lg border border-border text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed">
              {issue.description}
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase text-text-muted tracking-wider">
                Screenshot Attachments ({attachments.length})
              </h3>
            </div>

            {attachments.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-border bg-bg-primary/50 text-xs text-text-muted">
                No screenshot attachments provided with this ticket.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewAttachment(att)}
                    className="relative group rounded-lg overflow-hidden border border-border bg-bg-primary aspect-video flex items-center justify-center cursor-pointer shadow hover:border-accent transition"
                  >
                    <img
                      src={att.url}
                      alt={att.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs bg-bg-primary/90 text-text-primary px-2.5 py-1 rounded font-medium shadow border border-border flex items-center gap-1">
                        <span>🔍</span>
                        <span>Preview</span>
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1 text-[10px] text-white truncate pointer-events-none">
                      {att.file_name} ({formatBytes(att.size_bytes)})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-border bg-bg-primary flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-bg-tertiary hover:bg-bg-secondary text-text-secondary hover:text-text-primary rounded-md border border-border transition cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReject(issue);
              }}
              disabled={processing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-md transition disabled:opacity-50 cursor-pointer shadow"
            >
              Reject...
            </button>
            <button
              type="button"
              onClick={() => {
                onApprove(issue.id);
                onClose();
              }}
              disabled={processing}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-md transition disabled:opacity-50 cursor-pointer shadow"
            >
              {processing ? "Approving..." : "Approve Ticket"}
            </button>
          </div>
        </div>

        {/* Nested Image Lightbox */}
        {previewAttachment && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setPreviewAttachment(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-primary">
                <div className="truncate max-w-[500px]">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {previewAttachment.file_name}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {formatBytes(previewAttachment.size_bytes)}
                    {previewAttachment.uploader?.name && ` • Uploaded by ${previewAttachment.uploader.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewAttachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-text-primary px-2.5 py-1 rounded border border-border transition cursor-pointer"
                  >
                    Open Original ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(null)}
                    className="text-text-muted hover:text-text-primary p-1 rounded-md text-lg transition cursor-pointer leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center p-2 bg-black/60 overflow-auto">
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.file_name}
                  className="max-h-[75vh] max-w-full object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

