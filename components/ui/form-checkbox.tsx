"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  className?: string;
  error?: string;
  id?: string;
  name?: string;
}

export const FormCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  FormCheckboxProps
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox ref={ref} {...props} id={props.id || props.name} />
        <Label htmlFor={props.id || props.name} className="font-normal">
          {label}
        </Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
});

FormCheckbox.displayName = "FormCheckbox";
