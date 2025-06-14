"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export default function AiToolsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">AI Tools</h1>
      <p className="text-muted-foreground">
        A collection of AI-powered utilities to help you work more efficiently.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <SecurePasswordGenerator />
        <TextSummarizer />
        <Translator />
        <EmailDraftGenerator />
        <MarketingIdeas />
        <NewsletterThemeSuggester />
        <SupportReplyGenerator />
        <SocialPostIdeas />
      </div>
    </div>
  );
}

function SecurePasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const { toast } = useToast();

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/generate",
  });

  const generatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `
      Generate a secure, random password with the following criteria:
      - Length: ${length} characters
      - Must include lowercase and uppercase letters.
      - ${
        includeNumbers
          ? "Must include numbers (0-9)."
          : "Do not include numbers."
      }
      - ${
        includeSymbols
          ? "Must include symbols (e.g., !@#$%^&*)."
          : "Do not include symbols."
      }
      Only output the password itself, with no additional text, explanation, or markdown.
    `;
    complete(prompt);
  };

  const copyToClipboard = () => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      toast({ title: "Copied!", description: "Password copied to clipboard." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Password Generator</CardTitle>
        <CardDescription>
          Create a strong, random password using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generatePassword} className="space-y-4">
          <div>
            <Label htmlFor="length">Password Length</Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              min="8"
              max="128"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeNumbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))}
            />
            <Label htmlFor="includeNumbers">Include Numbers</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSymbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))}
            />
            <Label htmlFor="includeSymbols">Include Symbols</Label>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Password"}
          </Button>
        </form>
        {completion && (
          <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
            <code className="font-mono text-sm break-all">{completion}</code>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TextSummarizer() {
  const [text, setText] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const summarize = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Summarize the following text in a concise paragraph:\n${text}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Summarizer</CardTitle>
        <CardDescription>Quickly summarize long passages of text.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={summarize} className="space-y-4">
          <div>
            <Label htmlFor="summary-text">Text to Summarize</Label>
            <textarea
              id="summary-text"
              className="w-full rounded-md border p-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Summarizing..." : "Summarize"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Translator() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("es");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const translate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Translate the following text to ${targetLang}:\n${text}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translator</CardTitle>
        <CardDescription>Translate text into another language.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={translate} className="space-y-4">
          <div>
            <Label htmlFor="translate-text">Text</Label>
            <textarea
              id="translate-text"
              className="w-full rounded-md border p-2"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="targetLang">Target Language</Label>
            <Input
              id="targetLang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Translating..." : "Translate"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function EmailDraftGenerator() {
  const [topic, setTopic] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Write a professional email about: ${topic}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Draft Generator</CardTitle>
        <CardDescription>Let AI craft a quick email draft.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generate} className="space-y-4">
          <Input
            placeholder="Email topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MarketingIdeas() {
  const [product, setProduct] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Provide creative marketing campaign ideas for: ${product}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Ideas</CardTitle>
        <CardDescription>Brainstorm promotional campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generate} className="space-y-4">
          <Input
            placeholder="Product or service"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function NewsletterThemeSuggester() {
  const [audience, setAudience] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const suggest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Suggest five engaging newsletter themes for an audience of: ${audience}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Theme Suggester</CardTitle>
        <CardDescription>Get inspiration for your next newsletter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={suggest} className="space-y-4">
          <Input
            placeholder="Target audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Suggesting..." : "Suggest"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SupportReplyGenerator() {
  const [question, setQuestion] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Write a helpful customer support reply to: ${question}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Reply Generator</CardTitle>
        <CardDescription>Craft polite responses to customer questions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generate} className="space-y-4">
          <Input
            placeholder="Customer question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SocialPostIdeas() {
  const [topic, setTopic] = useState("");
  const { completion, complete, isLoading } = useCompletion({ api: "/api/ai/generate" });

  const generate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = `Give me social media post ideas about: ${topic}`;
    complete(prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Post Ideas</CardTitle>
        <CardDescription>Generate catchy posts for social channels.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generate} className="space-y-4">
          <Input
            placeholder="Topic or event"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>
        {completion && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{completion}</p>
        )}
      </CardContent>
    </Card>
  );
}

