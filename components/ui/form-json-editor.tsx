"use client";

import { useState, useEffect } from "react";
import { FormLabel } from "./form";
import { FormInput } from "./form-input";
import { Button } from "./button";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyValue {
  id: number;
  key: string;
  value: string;
}

export interface FormJsonEditorProps {
  label: string;
  required?: boolean;
  value?: string; // Expects a JSON string
  onChange: (value: string) => void;
  helpText?: string;
  disabled?: boolean;
}

export function FormJsonEditor({
  label,
  required,
  value,
  onChange,
  helpText,
  disabled,
}: FormJsonEditorProps) {
  const [items, setItems] = useState<KeyValue[]>([]);

  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          const initialItems = Object.entries(parsed).map(([key, val], i) => ({
            id: i,
            key,
            value: String(val),
          }));
          setItems(initialItems);
        }
      }
    } catch (e) {
      console.error("Invalid JSON string provided to FormJsonEditor:", value);
      setItems([]);
    }
  }, [value]);

  const handleItemChange = (
    id: number,
    field: "key" | "value",
    val: string
  ) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    setItems(newItems);
    updateJson(newItems);
  };

  const addItem = () => {
    const newItems = [...items, { id: Date.now(), key: "", value: "" }];
    setItems(newItems);
    updateJson(newItems);
  };

  const removeItem = (id: number) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    updateJson(newItems);
  };

  const updateJson = (currentItems: KeyValue[]) => {
    const jsonObject = currentItems.reduce((acc, item) => {
      if (item.key) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);
    onChange(JSON.stringify(jsonObject, null, 2));
  };

  return (
    <div className={cn("form-group space-y-2", disabled && "opacity-50")}>
      <FormLabel required={required}>{label}</FormLabel>
      <div className="space-y-3 p-4 border rounded-md">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <FormInput
              label="Key"
              hideLabel
              placeholder="Key"
              value={item.key}
              onChange={(e) => handleItemChange(item.id, "key", e.target.value)}
              className="flex-1"
              disabled={disabled}
            />
            <FormInput
              label="Value"
              hideLabel
              placeholder="Value"
              value={item.value}
              onChange={(e) =>
                handleItemChange(item.id, "value", e.target.value)
              }
              className="flex-1"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              type="button"
              disabled={disabled}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          type="button"
          disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      {helpText && (
        <p className="text-sm text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}
