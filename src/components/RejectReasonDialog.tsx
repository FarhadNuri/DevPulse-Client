import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import type { Issue } from "../types";

interface RejectReasonDialogProps {
  open: boolean;
  issue: Issue | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

export default function RejectReasonDialog({
  open,
  issue,
  submitting,
  onClose,
  onConfirm,
}: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");

  if (!open || !issue) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length > 500) return;
    await onConfirm(trimmed);
    setReason("");
  }

  const trimmedLength = reason.trim().length;
  const isValid = trimmedLength >= 1 && trimmedLength <= 500;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!submitting) {
          setReason("");
          onClose();
        }
      }}
      title="Reject Issue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="text-sm text-text-muted mb-1">
            Rejecting ticket from <span className="text-text-primary font-medium">{issue.reporter?.name || "Client"}</span>:
          </div>
          <div className="text-sm font-semibold text-text-primary bg-bg-tertiary px-3 py-2 rounded-md border border-border truncate">
            {issue.title}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="rejectionReason" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Reason for Rejection <span className="text-red-400">*</span>
            </label>
            <span
              className={`text-xs font-mono ${
                trimmedLength > 500 ? "text-red-400 font-bold" : "text-text-muted"
              }`}
            >
              {trimmedLength} / 500
            </span>
          </div>
          <textarea
            id="rejectionReason"
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain to the client why this ticket is being rejected and what information is needed..."
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus transition resize-none placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setReason("");
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary bg-bg-tertiary hover:bg-border/40 rounded-md transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition cursor-pointer"
          >
            {submitting ? "Rejecting..." : "Reject Ticket"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

