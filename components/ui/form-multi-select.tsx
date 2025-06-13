"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export interface Option {
  value: any;
  label: string;
}

interface FormMultiSelectProps {
  options: Option[];
  value: any[];
  onChange: (value: any[]) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  creatableApiUrl?: string;
  onNewItemsCreated?: () => void;
  displayField?: string;
}

export function FormMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  creatableApiUrl,
  onNewItemsCreated,
  displayField = "name",
}: FormMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newItemsInput, setNewItemsInput] = React.useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (itemName: string) =>
      api.createModelItem(creatableApiUrl!, { [displayField]: itemName }),
    onError: (error: Error, itemName) => {
      toast({
        variant: "destructive",
        title: `Error creating "${itemName}"`,
        description: error.message,
      });
    },
  });

  const handleCreateNewItems = async () => {
    if (!creatableApiUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Creation is not configured for this field.",
      });
      return;
    }

    const itemNames = newItemsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const createdItems: any[] = [];
    for (const name of itemNames) {
      try {
        const newItem = await createMutation.mutateAsync(name);
        if (newItem?.id) {
          createdItems.push(newItem.id);
        }
      } catch (e) {
        // Errors are handled by the mutation's onError callback
      }
    }

    if (createdItems.length > 0) {
      toast({
        title: "Success",
        description: `${createdItems.length} new item(s) created.`,
      });
      onNewItemsCreated?.();
      onChange([...value, ...createdItems]);
    }

    setDialogOpen(false);
    setNewItemsInput("");
  };

  const selectedValues = new Set(value);
  const selectedOptions = options.filter((option) =>
    selectedValues.has(option.value)
  );

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10">
            <div className="flex flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge key={option.value} variant="secondary">
                    {option.label}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground font-normal">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search or create..." />
            <CommandList>
              <CommandEmpty>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create new
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Item(s)</DialogTitle>
                      <DialogDescription>
                        You can create multiple items by separating them with a
                        comma (,).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="e.g., New Tag 1, Another Tag, Final Tag"
                        value={newItemsInput}
                        onChange={(e) => setNewItemsInput(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateNewItems}
                        disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          onChange(value.filter((v) => v !== option.value));
                        } else {
                          onChange([...value, option.value]);
                        }
                      }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
