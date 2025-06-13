"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./form";

export interface FormFileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

const FormFileUpload = React.forwardRef<HTMLInputElement, FormFileUploadProps>(
  ({ name, className, label, required, error, helpText, ...props }, ref) => {
    const [fileName, setFileName] = React.useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
      } else {
        setFileName(null);
      }
      // We don't call props.onChange here because react-hook-form handles it
    };

    return (
      <div className="form-group">
        <FormLabel htmlFor={props.id || name} required={required}>
          {label}
        </FormLabel>
        <input
          type="file"
          id={props.id || name}
          name={name}
          className={cn("form-input", error && "border-red-500", className)}
          ref={ref}
          onChange={handleFileChange}
          {...props}
        />

        {fileName && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected file: {fileName}
          </p>
        )}
        {helpText && (
          <p className="text-sm text-muted-foreground mt-1">{helpText}</p>
        )}
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

FormFileUpload.displayName = "FormFileUpload";

export { FormFileUpload };
