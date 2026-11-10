import { useState, useEffect, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { comments as commentsApi } from "../api";
import { useOrg } from "../hooks";
import type { Comment, MentionableUser } from "../types";
import { formatDate } from "../utils";
import toast from "react-hot-toast";

interface CommentSectionProps {
  orgId: number;
  issueId: number;
  projectId?: number;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string } | null;
  alwaysExpanded?: boolean;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-500/15 text-purple-400",
  admin: "bg-indigo-500/15 text-indigo-400",
  maintainer: "bg-indigo-500/15 text-indigo-400",
  contributor: "bg-blue-500/15 text-blue-400",
  client: "bg-amber-500/15 text-amber-400",
  guest: "bg-amber-500/15 text-amber-400",
};

export default function CommentSection({
  orgId,
  issueId,
  projectId,
  isLoggedIn,
  currentUser,
  alwaysExpanded = false,
}: CommentSectionProps) {
  const { isMaintainer } = useOrg();
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mention state
  const [mentionables, setMentionables] = useState<MentionableUser[]>([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [trackedMentionIds, setTrackedMentionIds] = useState<Map<string, number>>(new Map());

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (alwaysExpanded) {
      setExpanded(true);
    }
  }, [alwaysExpanded]);

  useEffect(() => {
    if (expanded && commentList.length === 0) {
      fetchComments();
    }
  }, [expanded]);

  // Load mentionables if projectId is provided
  useEffect(() => {
    if (orgId && projectId) {
      commentsApi
        .getMentionable(orgId, projectId)
        .then((users) => setMentionables(users || []))
        .catch(() => {});
    }
  }, [orgId, projectId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const data = await commentsApi.list(orgId, issueId);
      setCommentList(data || []);
      setCommentCount(data?.length || 0);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  // Filter mentionables by current mentionQuery
  const filteredMentionables = mentionables.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  function handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;
    setNewCommentBody(val);

    // Look back from cursor to see if user is currently typing a mention
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
      if (/\s/.test(charBeforeAt)) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        if (!query.includes("\n") && query.length <= 25) {
          setShowMentionPicker(true);
          setMentionQuery(query);
          setMentionStartIndex(lastAtIndex);
          setSelectedMentionIndex(0);
          return;
        }
      }
    }

    setShowMentionPicker(false);
  }

  function handleSelectMention(user: MentionableUser) {
    if (mentionStartIndex === -1 || !textareaRef.current) return;

    const before = newCommentBody.slice(0, mentionStartIndex);
    const cursor = textareaRef.current.selectionStart || 0;
    const after = newCommentBody.slice(cursor);

    const insertedText = `@${user.name} `;
    const updatedBody = before + insertedText + after;

    setNewCommentBody(updatedBody);
    setShowMentionPicker(false);

    // Track user ID for this mention name
    setTrackedMentionIds((prev) => {
      const next = new Map(prev);
      next.set(`@${user.name}`, user.id);
      return next;
    });

    // Move cursor right after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = before.length + insertedText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 10);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!showMentionPicker || filteredMentionables.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => (prev + 1) % filteredMentionables.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex(
        (prev) => (prev - 1 + filteredMentionables.length) % filteredMentionables.length
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const targetUser = filteredMentionables[selectedMentionIndex];
      if (targetUser) {
        handleSelectMention(targetUser);
      }
    } else if (e.key === "Escape") {
      setShowMentionPicker(false);
    }
  }

  async function handleSubmitComment() {
    const trimmed = newCommentBody.trim();
    if (!trimmed) return;

    // Determine which tracked mentions are actually present in the final comment text
    const activeMentionIds: number[] = [];
    trackedMentionIds.forEach((userId, mentionTag) => {
      if (trimmed.includes(mentionTag)) {
        activeMentionIds.push(userId);
      }
    });

    setSubmitting(true);
    try {
      const newComment = await commentsApi.create(
        orgId,
        issueId,
        trimmed,
        activeMentionIds.length > 0 ? activeMentionIds : undefined
      );
      setCommentList([...commentList, newComment]);
      setCommentCount(commentCount + 1);
      setNewCommentBody("");
      setShowMentionPicker(false);
      setTrackedMentionIds(new Map());
      toast.success("Comment posted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    setDeleting(true);
    try {
      await commentsApi.remove(orgId, commentId);
      setCommentList(commentList.filter((c) => c.id !== commentId));
      setCommentCount(commentCount - 1);
      setDeleteConfirmId(null);
      toast.success("Comment deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  }

  function canDeleteComment(comment: Comment): boolean {
    if (!currentUser) return false;
    return comment.author.id === currentUser.id || isMaintainer;
  }

  function renderCommentBody(body: string, mentions?: { id: number; name: string }[]) {
    if (!mentions || mentions.length === 0) {
      return <span>{body}</span>;
    }

    // Build regex to match @MentionName
    const names = mentions.map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(@(?:${names.join("|")}))\\b`, "gi");

    const parts = body.split(regex);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith("@")) {
            const cleanName = part.slice(1);
            const matched = mentions.some(
              (m) => m.name.toLowerCase() === cleanName.toLowerCase()
            );
            if (matched) {
              return (
                <span
                  key={i}
                  className="inline-flex items-center font-semibold text-accent bg-accent/15 px-1 py-0.5 rounded text-xs mx-0.5"
                >
                  {part}
                </span>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  const charCount = newCommentBody.length;
  const maxChars = 1000;
  const isSubmitDisabled = !newCommentBody.trim() || charCount > maxChars || submitting;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {!alwaysExpanded && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition"
        >
          <span>💬 Comments ({commentCount})</span>
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {expanded && (
        <div className="mt-3 bg-bg-primary rounded-lg border border-border p-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
            </div>
          ) : commentList.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {commentList.map((comment) => (
                <div
                  key={comment.id}
                  className="pb-3 border-b border-border last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text-primary">
                        {comment.author.name}
                      </span>
                      {comment.author.role && (
                        <span
                          className={`text-xs font-medium rounded-md px-2 py-0.5 ${
                            roleColors[comment.author.role] || "bg-bg-tertiary text-text-muted"
                          }`}
                        >
                          {comment.author.role}
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    {canDeleteComment(comment) && (
                      <div className="shrink-0">
                        {deleteConfirmId === comment.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-muted mr-1">Confirm?</span>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleting}
                              className="cursor-pointer text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={deleting}
                              className="cursor-pointer text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded bg-bg-tertiary hover:bg-bg-tertiary/70 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(comment.id)}
                            className="text-xs text-text-muted hover:text-red-400 transition p-1 hover:bg-red-500/10 rounded cursor-pointer"
                            title="Delete comment"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed">
                    {renderCommentBody(comment.body, comment.mentions)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            <div className="space-y-2 pt-2 relative">
              {/* @mention autocomplete popup */}
              {showMentionPicker && (
                <div
                  ref={mentionPickerRef}
                  className="absolute bottom-full mb-1 left-0 z-50 w-72 max-h-52 overflow-y-auto bg-bg-secondary border border-border rounded-lg shadow-xl p-1 animate-in fade-in"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/50">
                    Mention team member
                  </div>
                  {filteredMentionables.length === 0 ? (
                    <div className="p-3 text-xs text-text-muted text-center">
                      No members matching "@{mentionQuery}"
                    </div>
                  ) : (
                    filteredMentionables.map((user, idx) => (
                      <div
                        key={user.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
                          handleSelectMention(user);
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                          idx === selectedMentionIndex
                            ? "bg-accent text-white"
                            : "text-text-primary hover:bg-bg-tertiary"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            idx === selectedMentionIndex
                              ? "bg-white/20 text-white"
                              : "bg-accent/20 text-accent"
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-medium truncate">{user.name}</p>
                          <p
                            className={`text-[10px] truncate ${
                              idx === selectedMentionIndex ? "text-white/80" : "text-text-muted"
                            }`}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={newCommentBody}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment... (Type @ to mention team members)"
                rows={3}
                maxLength={maxChars}
                className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus resize-none transition"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    charCount > maxChars ? "text-red-400" : "text-text-muted"
                  }`}
                >
                  {charCount} / {maxChars}
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmitDisabled}
                  className="bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-md px-4 py-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-2">
              Login to comment
            </p>
          )}
        </div>
      )}
    </div>
  );
}
