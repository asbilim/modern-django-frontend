"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Comment } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
  locale: string;
}

function CommentItem({
  comment,
  onReply,
  locale,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
  locale: string;
}) {
  const t = useTranslations("BlogPage");
  return (
    <div className="flex flex-col gap-2 py-4 border-b">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{comment.author_name}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(comment.created_at).toLocaleDateString(locale)}
        </span>
      </div>
      <p className="text-sm">{comment.content}</p>
      <Button
        variant="link"
        size="sm"
        onClick={() => onReply(comment.id)}
        className="self-start p-0 h-auto">
        {t("reply")}
      </Button>
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 border-l ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, locale }: CommentSectionProps) {
  const t = useTranslations("BlogPage");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.getPostComments(locale, postId),
  });

  const mutation = useMutation({
    mutationFn: (newComment: {
      content: string;
      parent: string | null;
      author_name?: string;
      author_email?: string;
    }) => api.createComment(postId, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setCommentText("");
      setReplyingTo(null);
      toast({ title: t("commentSuccess") });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("commentError"),
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText) return;

    let submissionData: {
      content: string;
      parent: string | null;
      author_name?: string;
      author_email?: string;
    } = {
      content: commentText,
      parent: replyingTo,
    };

    if (!session) {
      submissionData.author_name = guestInfo.name;
      submissionData.author_email = guestInfo.email;
    }

    mutation.mutate(submissionData);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t("commentsTitle")}</h2>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={
              replyingTo ? t("replyPlaceholder") : t("commentPlaceholder")
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          {!session && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder={t("namePlaceholder")}
                value={guestInfo.name}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, name: e.target.value })
                }
                required
              />
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={guestInfo.email}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, email: e.target.value })
                }
                required
              />
            </div>
          )}
          <div className="flex justify-between items-center">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("submittingComment") : t("submitComment")}
            </Button>
            {replyingTo && (
              <Button variant="ghost" onClick={() => setReplyingTo(null)}>
                {t("cancelReply")}
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {isLoading && <p>{t("loadingComments")}</p>}
        {commentsData?.results.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={setReplyingTo}
            locale={locale}
          />
        ))}
        {commentsData?.results.length === 0 && <p>{t("noComments")}</p>}
      </div>
    </div>
  );
}
