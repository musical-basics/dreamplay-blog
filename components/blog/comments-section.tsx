"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { type Comment, formatDate } from "@/lib/blog-data";
import { submitComment } from "@/app/actions/submit-comment";

interface CommentsSectionProps {
  comments: Comment[];
  postId: string;
}

export function CommentsSection({ comments: initialComments, postId }: CommentsSectionProps) {
  // We don't necessarily need to update the comments list client-side immediately 
  // since they go to moderation, but we can if we wanted to show "Pending".
  // For now, we will just show the approved ones passed in.
  const [comments] = useState(initialComments);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("comment", formData.comment);
    formDataObj.append("postId", postId);

    const result = await submitComment(null, formDataObj);

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus({ success: true, message: result.message });
      setFormData({ name: "", email: "", comment: "" });
    } else {
      setSubmitStatus({ success: false, message: result.message || "Failed to submit comment." });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="border-t border-border pt-12">
      <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="mb-12 rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-medium text-foreground">
          Leave a Comment
        </h3>

        {submitStatus?.success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-semibold text-foreground">Comment Submitted!</h4>
            <p className="mt-2 text-muted-foreground">{submitStatus.message}</p>
            <button
              onClick={() => setSubmitStatus(null)}
              className="mt-6 text-sm font-medium text-accent hover:underline"
            >
              Post another comment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Email <span className="text-muted-foreground">(private)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Comment
              </label>
              <textarea
                id="comment"
                required
                rows={4}
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className="w-full resize-none rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Share your thoughts..."
              />
            </div>

            {submitStatus?.success === false && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  Post Comment
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="flex gap-4 rounded-lg border border-border bg-card/50 p-5"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                {getInitials(comment.name)}
              </div>
              {/* Content */}
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">
                    {comment.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {comment.comment}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Be the first to leave a comment!
          </p>
        )}
      </div>
    </section>
  );
}
