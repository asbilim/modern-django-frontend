import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ className, children, isLoading, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "form-button",
          isLoading && "opacity-80",
          className
        )}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block mr-2 animate-spin">⟳</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

FormButton.displayName = "FormButton";

export { FormButton };
