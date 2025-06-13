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
        {/* Add more AI tool components here */}
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
