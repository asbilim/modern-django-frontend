"use client";

import React, { useState, useMemo } from "react";
import { useCompletion } from "@ai-sdk/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Copy,
  KeyRound,
  FileText,
  Languages,
  Mail,
  Lightbulb,
  Newspaper,
  LifeBuoy,
  Share2,
  Sparkles,
} from "lucide-react";
import { AiResult } from "@/components/ai-result";

export default function AiToolsPage() {
  const t = useTranslations("AiToolsPage");

  const toolDefinitions = useMemo(
    () => [
      {
        id: "summarizer",
        title: t("summarizer.title"),
        description: t("summarizer.description"),
        icon: <FileText className="h-6 w-6" />,
        component: TextSummarizer,
      },
      {
        id: "translator",
        title: t("translator.title"),
        description: t("translator.description"),
        icon: <Languages className="h-6 w-6" />,
        component: Translator,
      },
      {
        id: "email_drafter",
        title: t("emailDrafter.title"),
        description: t("emailDrafter.description"),
        icon: <Mail className="h-6 w-6" />,
        component: EmailDraftGenerator,
      },
      {
        id: "support_reply",
        title: t("supportReply.title"),
        description: t("supportReply.description"),
        icon: <LifeBuoy className="h-6 w-6" />,
        component: SupportReplyGenerator,
      },
      {
        id: "social_post",
        title: t("socialPost.title"),
        description: t("socialPost.description"),
        icon: <Share2 className="h-6 w-6" />,
        component: SocialPostIdeas,
      },
      {
        id: "marketing_ideas",
        title: t("marketingIdeas.title"),
        description: t("marketingIdeas.description"),
        icon: <Lightbulb className="h-6 w-6" />,
        component: MarketingIdeas,
      },
      {
        id: "newsletter_themes",
        title: t("newsletterThemes.title"),
        description: t("newsletterThemes.description"),
        icon: <Newspaper className="h-6 w-6" />,
        component: NewsletterThemeSuggester,
      },
      {
        id: "password_generator",
        title: t("passwordGenerator.title"),
        description: t("passwordGenerator.description"),
        icon: <KeyRound className="h-6 w-6" />,
        component: SecurePasswordGenerator,
      },
    ],
    [t]
  );

  const [selectedToolId, setSelectedToolId] = useState(toolDefinitions[0].id);

  const SelectedToolComponent = useMemo(() => {
    const tool = toolDefinitions.find((tool) => tool.id === selectedToolId);
    return tool ? tool.component : null;
  }, [selectedToolId, toolDefinitions]);

  const selectedTool = useMemo(() => {
    return toolDefinitions.find((tool) => tool.id === selectedToolId);
  }, [selectedToolId, toolDefinitions]);

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6 h-full">
      <aside className="border rounded-lg p-4 flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 mb-6 px-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1">
          {toolDefinitions.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedToolId(tool.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-muted/50",
                selectedToolId === tool.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground"
              )}>
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  selectedToolId === tool.id
                    ? "bg-primary/20"
                    : "bg-muted text-muted-foreground"
                )}>
                {React.cloneElement(tool.icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <p className="font-semibold text-sm">{tool.title}</p>
                <p className="text-xs text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="overflow-y-auto h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedToolId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {selectedTool &&
                    React.cloneElement(selectedTool.icon, {
                      className: "h-6 w-6",
                    })}
                  <span>{selectedTool?.title}</span>
                </CardTitle>
                <CardDescription>{selectedTool?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {SelectedToolComponent && <SelectedToolComponent />}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AiOutput({
  completion,
  onCopy,
}: {
  completion: string | null;
  onCopy?: () => void;
}) {
  const t = useTranslations("AiToolsPage");
  if (!completion) return null;
  return (
    <div className="mt-6">
      <Label>{t("resultTitle")}</Label>
      <div className="bg-muted p-4 rounded-md relative group mt-2 border">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {completion}
        </p>
        {onCopy && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SecurePasswordGenerator() {
  const t = useTranslations("AiToolsPage.passwordGenerator");
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(
      `Generate a secure, random password with length ${length}, ${
        includeNumbers ? "including numbers" : "no numbers"
      }, and ${
        includeSymbols ? "including symbols" : "no symbols"
      }. Output only the password.`
    );
  };

  const copyToClipboard = () => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      toast({ title: t("copySuccess"), description: t("copyDescription") });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={generatePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="length">{t("lengthLabel")}</Label>
          <Input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            min="8"
            max="128"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="includeNumbers"
            checked={includeNumbers}
            onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))}
          />
          <Label htmlFor="includeNumbers" className="text-sm font-normal">
            {t("numbersLabel")}
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="includeSymbols"
            checked={includeSymbols}
            onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))}
          />
          <Label htmlFor="includeSymbols" className="text-sm font-normal">
            {t("symbolsLabel")}
          </Label>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={copyToClipboard}
        onRegenerate={() =>
          generatePassword(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function TextSummarizer() {
  const t = useTranslations("AiToolsPage.summarizer");
  const [text, setText] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const summarize = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(`Summarize this text concisely:\n${text}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={summarize} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary-text">{t("textLabel")}</Label>
          <Textarea
            id="summary-text"
            className="min-h-[200px] lg:min-h-[300px]"
            placeholder={t("textPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          summarize(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function Translator() {
  const t = useTranslations("AiToolsPage.translator");
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const translate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(`Translate to ${targetLang}:\n${text}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={translate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="translate-text">{t("textLabel")}</Label>
            <Textarea
              id="translate-text"
              className="min-h-[120px]"
              placeholder={t("textPlaceholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetLang">{t("languageLabel")}</Label>
            <Input
              id="targetLang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              placeholder={t("languagePlaceholder")}
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          translate(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function EmailDraftGenerator() {
  const t = useTranslations("AiToolsPage.emailDrafter");
  const [topic, setTopic] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(`Write a professional email about: ${topic}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-topic">{t("topicLabel")}</Label>
          <Input
            id="email-topic"
            placeholder={t("topicPlaceholder")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          generate(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function MarketingIdeas() {
  const t = useTranslations("AiToolsPage.marketingIdeas");
  const [product, setProduct] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(`Provide creative marketing campaign ideas for: ${product}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">{t("productLabel")}</Label>
          <Input
            id="product"
            placeholder={t("productPlaceholder")}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          generate(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function NewsletterThemeSuggester() {
  const t = useTranslations("AiToolsPage.newsletterThemes");
  const [audience, setAudience] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const suggest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(
      `Suggest 5 engaging newsletter themes for an audience of: ${audience}`
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={suggest} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audience">{t("audienceLabel")}</Label>
          <Input
            id="audience"
            placeholder={t("audiencePlaceholder")}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          suggest(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function SupportReplyGenerator() {
  const t = useTranslations("AiToolsPage.supportReply");
  const [question, setQuestion] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(
      `Write a helpful and empathetic customer support reply to: ${question}`
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-q">{t("questionLabel")}</Label>
          <Input
            id="customer-q"
            placeholder={t("questionPlaceholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          generate(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}

function SocialPostIdeas() {
  const t = useTranslations("AiToolsPage.socialPost");
  const [topic, setTopic] = useState("");
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    complete(`Give me 5 creative social media post ideas about: ${topic}`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={generate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="social-topic">{t("topicLabel")}</Label>
          <Input
            id="social-topic"
            placeholder={t("topicPlaceholder")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? t("buttonLoading") : t("button")}
        </Button>
      </form>
      <AiResult
        content={completion || ""}
        isLoading={isLoading}
        onCopy={() => {}}
        onRegenerate={() =>
          generate(
            new Event("submit") as any as React.FormEvent<HTMLFormElement>
          )
        }
      />
    </div>
  );
}
