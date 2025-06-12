import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  error?: string;
}

const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="form-group">
        <div className="form-checkbox-container">
          <input
            type="checkbox"
            className={cn(
              "form-checkbox",
              error && "border-red-500",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            {...props}
          />
          <label
            className="form-checkbox-label"
            htmlFor={props.id || props.name}>
            {label}
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export { FormCheckbox };
