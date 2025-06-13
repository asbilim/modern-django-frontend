"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface Option {
  value: any;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required,
  error,
}: FormSelectProps) {
  return (
    <div className="w-full space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
