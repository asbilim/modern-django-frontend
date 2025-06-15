"use client";

import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, Tag, Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommentSection } from "@/components/blog/CommentSection";
import { Category, Tag as TagType } from "@/types/blog";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

const getCorrectImageUrl = (url: string) => {
  if (!url) return "";
  // Fix for malformed URLs from R2
  if (url.startsWith("https://https:/")) {
    return url.replace("https://https:/", "https://");
  }
  // If URL is relative, prepend the API base URL
  if (url.startsWith("/media")) {
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  }
  return url;
};

export default function BlogPostPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = useTranslations("BlogPage");

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id, locale],
    queryFn: () => api.getBlogPost(locale, id),
    retry: false,
  });

  useEffect(() => {
    console.log("--- Blog Post Page Debug ---");
    console.log("Locale:", locale, "ID:", id);
    console.log("Is Loading:", isLoading);
    console.log("Error object:", error);
    console.log("Post data:", post);
    console.log("----------------------------");
  }, [locale, id, isLoading, error, post]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {t("loading")}
      </div>
    );
  }

  if (error || !post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            {post.title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {post.author.first_name} {post.author.last_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{t("readingTime", { minutes: post.reading_time })}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            {post.categories.map((category: Category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        </header>

        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image
              src={getCorrectImageUrl(post.featured_image)}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <footer className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag: TagType) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </footer>
      </article>

      <CommentSection postId={post.id} locale={locale} />
    </div>
  );
}
