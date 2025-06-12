import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, required, error, ...props }, ref) => {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={props.id || props.name}>
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
        <input
          className={cn("form-input", error && "border-red-500", className)}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
