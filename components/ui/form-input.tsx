"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
  hideLabel?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, required, error, hideLabel, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {!hideLabel && (
          <Label htmlFor={props.id || props.name}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          className={cn(error && "border-destructive", className)}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
