import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { attachments as attachmentsApi, uploadToCloudinary } from "../api";
import { useConfirm } from "../hooks";
import type { Attachment } from "../types";
import { formatDate } from "../utils";
import toast from "react-hot-toast";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_FILES = 5;

interface AttachmentUploaderProps {
  orgId: number;
  issueId?: number; // If provided, direct upload mode.
  attachments?: Attachment[];
  canUpload?: boolean;
  canDelete?: boolean;
  currentUserId?: number;
  isMaintainer?: boolean;
  onAttachmentAdded?: (attachment: Attachment) => void;
  onAttachmentDeleted?: (attachmentId: number) => void;

  // Staged mode props (e.g. for NewIssueModal before issue exists)
  stagedFiles?: File[];
  onStagedFilesChange?: (files: File[]) => void;
}

export default function AttachmentUploader({
  orgId,
  issueId,
  attachments = [],
  canUpload = true,
  currentUserId,
  isMaintainer = false,
  onAttachmentAdded,
  onAttachmentDeleted,
  stagedFiles,
  onStagedFilesChange,
}: AttachmentUploaderProps) {
  const confirm = useConfirm();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    file_name: string;
    size_bytes?: number;
    uploader?: { name: string };
    created_at?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isStagedMode = !issueId && stagedFiles !== undefined && onStagedFilesChange !== undefined;
  const currentTotal = isStagedMode
    ? (stagedFiles?.length || 0)
    : attachments.length;

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid format for "${file.name}". Only PNG, JPEG, and WEBP images are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 5 MB.`;
    }
    return null;
  }

  async function handleFilesSelected(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (currentTotal + fileArray.length > MAX_TOTAL_FILES) {
      toast.error(`Maximum ${MAX_TOTAL_FILES} attachments allowed per issue.`);
      return;
    }

    for (const file of fileArray) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        toast.error(errorMsg);
        return;
      }
    }

    if (isStagedMode) {
      onStagedFilesChange!([...(stagedFiles || []), ...fileArray]);
      return;
    }

    if (!issueId) return;

    // Direct upload mode
    setUploading(true);
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadingFileName(file.name);
        setUploadProgress(10);

        // 1. Sign
        const signResult = await attachmentsApi.sign(orgId, issueId, {
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });

        // 2. Upload to Cloudinary with progress
        const uploaded = await uploadToCloudinary(signResult, file, (percent) => {
          setUploadProgress(Math.max(15, percent));
        });

        // 3. Register with API
        const newAttachment = await attachmentsApi.create(orgId, issueId, {
          url: uploaded.url,
          public_id: uploaded.public_id,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });

        if (onAttachmentAdded) {
          onAttachmentAdded(newAttachment);
        }
      }
      toast.success(
        fileArray.length === 1 ? "Screenshot attached" : `${fileArray.length} screenshots attached`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload attachment");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadingFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (canUpload && !uploading && currentTotal < MAX_TOTAL_FILES) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (!canUpload || uploading || currentTotal >= MAX_TOTAL_FILES) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  }

  async function handleDeleteAttachment(attachment: Attachment) {
    const ok = await confirm({
      title: "Delete Attachment",
      message: `Are you sure you want to delete "${attachment.file_name}"? This file will be permanently removed.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await attachmentsApi.remove(orgId, attachment.id);
      if (onAttachmentDeleted) {
        onAttachmentDeleted(attachment.id);
      }
      toast.success("Attachment deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete attachment");
    }
  }

  function handleRemoveStaged(index: number) {
    if (!isStagedMode || !stagedFiles) return;
    const next = [...stagedFiles];
    next.splice(index, 1);
    onStagedFilesChange!(next);
  }

  function formatBytes(bytes?: number): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      {/* Upload Dropzone */}
      {canUpload && currentTotal < MAX_TOTAL_FILES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-3 text-center transition cursor-pointer select-none ${
            isDragging
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/60 bg-bg-primary/50"
          } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xl">📎</span>
            <p className="text-xs text-text-secondary font-medium">
              Click or drag screenshots here
            </p>
            <p className="text-[11px] text-text-muted">
              PNG, JPG, WEBP up to 5 MB ({MAX_TOTAL_FILES - currentTotal} more allowed)
            </p>
          </div>
        </div>
      )}

      {/* Uploading progress indicator */}
      {uploading && (
        <div className="bg-bg-primary border border-border rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="truncate max-w-[200px]">
              Uploading {uploadingFileName}...
            </span>
            <span className="font-semibold text-accent">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-200 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Staged files preview (in NewIssueModal) */}
      {isStagedMode && stagedFiles && stagedFiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-text-muted uppercase">
            Screenshots to upload ({stagedFiles.length}/{MAX_TOTAL_FILES}):
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {stagedFiles.map((file, idx) => {
              const objectUrl = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-border bg-bg-primary aspect-video flex items-center justify-center"
                >
                  <img
                    src={objectUrl}
                    alt={file.name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() =>
                      setPreviewAttachment({
                        url: objectUrl,
                        file_name: file.name,
                        size_bytes: file.size,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStaged(idx);
                    }}
                    className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white p-1 rounded-full text-[10px] opacity-90 group-hover:opacity-100 transition shadow"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[10px] text-white truncate">
                    {file.name} ({formatBytes(file.size)})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct mode: Existing Attachments */}
      {!isStagedMode && attachments && attachments.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-text-muted uppercase">
            Screenshots ({attachments.length}/{MAX_TOTAL_FILES}):
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {attachments.map((att) => {
              const canDeleteThis =
                isMaintainer || (currentUserId && att.uploaded_by === currentUserId);

              return (
                <div
                  key={att.id}
                  className="relative group rounded-lg overflow-hidden border border-border bg-bg-primary aspect-video flex items-center justify-center shadow-sm"
                >
                  <img
                    src={att.url}
                    alt={att.file_name}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-200"
                    onClick={() =>
                      setPreviewAttachment({
                        url: att.url,
                        file_name: att.file_name,
                        size_bytes: att.size_bytes,
                        uploader: att.uploader,
                        created_at: att.created_at,
                      })
                    }
                  />
                  {canDeleteThis && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttachment(att);
                      }}
                      className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white p-1 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                      title="Delete screenshot"
                    >
                      🗑️
                    </button>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1.5 py-0.5 text-[10px] text-white truncate pointer-events-none">
                    {att.file_name} ({formatBytes(att.size_bytes)})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox / Large Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-primary">
              <div className="truncate max-w-[450px]">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {previewAttachment.file_name}
                </p>
                <p className="text-[11px] text-text-muted">
                  {formatBytes(previewAttachment.size_bytes)}
                  {previewAttachment.uploader?.name && ` • Uploaded by ${previewAttachment.uploader.name}`}
                  {previewAttachment.created_at && ` • ${formatDate(previewAttachment.created_at)}`}
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

            {/* Image Body */}
            <div className="flex items-center justify-center p-2 bg-black/50 overflow-auto">
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
  );
}

