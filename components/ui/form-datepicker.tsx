"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FormDatePickerProps {
  label: string;
  required?: boolean;
  className?: string;
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
}

export function FormDatePicker({
  label,
  required,
  className,
  value,
  onChange,
  disabled,
}: FormDatePickerProps) {
  return (
    <div className={cn("form-group", className)}>
      <label className="form-label">
        {label} {required && <span className="text-gray-500">*</span>}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
