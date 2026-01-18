"use client";

import React from "react"

import { useState } from "react";
import { Send } from "lucide-react";
import { type Comment, formatDate } from "@/lib/blog-data";

interface CommentsSectionProps {
  comments: Comment[];
}

export function CommentsSection({ comments: initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - Replace with actual database submission
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newComment: Comment = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      comment: formData.comment,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setComments([newComment, ...comments]);
    setFormData({ name: "", email: "", comment: "" });
    setIsSubmitting(false);
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
      <form
        onSubmit={handleSubmit}
        className="mb-12 rounded-lg border border-border bg-card p-6"
      >
        <h3 className="mb-4 text-lg font-medium text-foreground">
          Leave a Comment
        </h3>
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
