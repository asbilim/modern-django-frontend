"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

export interface FormUuidInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormUuidInput = React.forwardRef<
  HTMLInputElement,
  FormUuidInputProps
>(({ className, label, value, ...props }, ref) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(String(value));
      toast({
        title: "Copied to clipboard",
        description: String(value),
      });
    }
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <div className="relative">
        <Input
          className={cn("pr-10", className)}
          ref={ref}
          value={value}
          readOnly
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full"
          onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

FormUuidInput.displayName = "FormUuidInput";
