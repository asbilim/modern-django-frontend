"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLabel } from "./form";

export interface FormSelectProps {
  label: string;
  required?: boolean;
  className?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  label,
  required,
  className,
  value,
  onValueChange,
  options,
  placeholder,
}: FormSelectProps) {
  return (
    <div className={`form-group ${className}`}>
      <FormLabel required={required}>{label}</FormLabel>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 