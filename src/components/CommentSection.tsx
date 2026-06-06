import { useState, useEffect } from "react";
import { comments as commentsApi } from "../api";
import type { Comment } from "../types";
import { formatDate } from "../utils";
import toast from "react-hot-toast";

interface CommentSectionProps {
  issueId: number;
  isLoggedIn: boolean;
  currentUser: { id: number; name: string; role: string } | null;
  alwaysExpanded?: boolean;
}

const roleColors: Record<string, string> = {
  maintainer: "bg-indigo-500/15 text-indigo-400",
  contributor: "bg-blue-500/15 text-blue-400",
  client: "bg-amber-500/15 text-amber-400",
};

export default function CommentSection({ issueId, isLoggedIn, currentUser, alwaysExpanded = false }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function fetchComments() {
    setLoading(true);
    try {
      const data = await commentsApi.list(issueId);
      setCommentList(data);
      setCommentCount(data.length);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment() {
    const trimmed = newCommentBody.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const newComment = await commentsApi.create(issueId, trimmed);
      setCommentList([...commentList, newComment]);
      setCommentCount(commentCount + 1);
      setNewCommentBody("");
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
      await commentsApi.remove(commentId);
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
    return comment.author.id === currentUser.id || currentUser.role === "maintainer";
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
                      <span
                        className={`text-xs font-medium rounded-md px-2 py-0.5 ${
                          roleColors[comment.author.role]
                        }`}
                      >
                        {comment.author.role}
                      </span>
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
                  <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            <div className="space-y-2 pt-2">
              <textarea
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder="Write a comment..."
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
