"use client";

import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, Tag, Folder, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommentSection } from "@/components/blog/CommentSection";
import { Category, Tag as TagType } from "@/types/blog";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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

        <div className="prose dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-3xl prose-h1:lg:text-4xl prose-h2:text-2xl prose-h2:lg:text-3xl prose-h3:text-xl prose-h3:lg:text-2xl prose-h4:text-lg prose-h4:lg:text-xl prose-a:text-primary prose-a:underline prose-a:underline-offset-4 prose-a:hover:text-primary/80 prose-blockquote:border-l-2 prose-blockquote:border-primary/50 prose-blockquote:pl-6 prose-blockquote:italic prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-4 prose-img:rounded-lg prose-li:marker:text-primary">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1">
                  {props.children}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="mt-6 mb-4 border-b pb-2" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="mt-6 mb-3 border-b pb-1" />
              ),
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  className="rounded-md shadow-md my-6 mx-auto"
                  alt={props.alt || "Blog image"}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="my-6 list-disc pl-6" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="my-6 list-decimal pl-6" />
              ),
              table: ({ node, ...props }) => (
                <div className="my-6 w-full overflow-y-auto">
                  <table {...props} className="w-full" />
                </div>
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="mt-6 border-l-2 border-primary pl-6 italic"
                />
              ),
              code: (props) => {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={language}
                      PreTag="div"
                      className="rounded-md border my-6">
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
                }

                return (
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                    {children}
                  </code>
                );
              },
            }}>
            {post.content}
          </ReactMarkdown>
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
