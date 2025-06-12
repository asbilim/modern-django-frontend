import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, required, error, ...props }, ref) => {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={props.id || props.name}>
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
        <textarea
          className={cn("form-textarea", error && "border-red-500", className)}
          ref={ref}
          rows={5}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
