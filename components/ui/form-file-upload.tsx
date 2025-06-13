"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./form";
import { Button } from "./button";
import { X, Paperclip, FileImage, FileIcon } from "lucide-react";

export interface FormFileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
  value?: File | string | null;
  onRemove?: () => void;
}

const FormFileUpload = React.forwardRef<HTMLInputElement, FormFileUploadProps>(
  (
    {
      name,
      className,
      label,
      required,
      error,
      helpText,
      value,
      onChange,
      onRemove,
      accept,
      ...props
    },
    ref
  ) => {
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (value instanceof File) {
        if (value.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(value);
          setPreview(objectUrl);
          return () => URL.revokeObjectURL(objectUrl);
        }
        setPreview(null);
      } else if (typeof value === "string") {
        if (/\.(jpg|jpeg|png|gif|svg)$/i.test(value)) {
          setPreview(value);
        }
      } else {
        setPreview(null);
      }
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (onRemove) {
        onRemove();
      }
      setPreview(null);
      // This is tricky without full form control. Parent needs to clear value.
    };

    const renderPreview = () => {
      if (preview) {
        return (
          <div className="mt-2 relative w-32 h-32">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-md border"
            />
            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }

      if (value) {
        const fileName =
          typeof value === "string" ? value.split("/").pop() : value.name;
        return (
          <div className="mt-2 flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            {accept?.includes("image") ? (
              <FileImage className="h-5 w-5 text-muted-foreground" />
            ) : (
              <FileIcon className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">{fileName}</span>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-6 w-6"
                onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }

      return null;
    };

    return (
      <div className="form-group">
        <FormLabel htmlFor={props.id || name} required={required}>
          {label}
        </FormLabel>
        <div
          className={cn(
            "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md",
            error ? "border-destructive" : "border-input"
          )}>
          <div className="space-y-1 text-center">
            <Paperclip className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="flex text-sm text-muted-foreground">
              <label
                htmlFor={props.id || name}
                className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                <span>Upload a file</span>
                <input
                  id={props.id || name}
                  name={name}
                  type="file"
                  className="sr-only"
                  ref={ref}
                  onChange={handleFileChange}
                  accept={accept}
                  {...props}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {helpText || accept}
            </p>
          </div>
        </div>

        {renderPreview()}

        {error && <p className="form-error mt-2">{error}</p>}
      </div>
    );
  }
);

FormFileUpload.displayName = "FormFileUpload";

export { FormFileUpload };
