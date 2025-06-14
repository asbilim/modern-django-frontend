"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

interface AiResultProps {
  content: string;
  isLoading: boolean;
  onCopy: () => void;
  onRegenerate?: () => void;
}

export function AiResult({
  content,
  isLoading,
  onCopy,
  onRegenerate,
}: AiResultProps) {
  const t = useTranslations("AiToolsPage");
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: t("copySuccess"),
      description: t("copyDescription"),
    });
    onCopy();
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{t("resultTitle")}</h3>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("regenerate")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            {t("copy")}
          </Button>
        </div>
      </div>
      <div className="bg-muted/50 p-4 rounded-md border prose prose-sm max-w-none prose-p:leading-normal">
        {isLoading && !content ? (
          <p className="text-muted-foreground animate-pulse">
            {t("generating")}...
          </p>
        ) : (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold my-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold my-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold my-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-4 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 mb-4" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    className="bg-primary/10 text-primary px-1 py-0.5 rounded-sm"
                    {...props}
                  />
                ) : (
                  <pre
                    className="bg-foreground/5 p-2 rounded-md overflow-x-auto"
                    {...props}
                  />
                ),
            }}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
