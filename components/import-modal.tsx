"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelKey: string;
  modelName: string;
}

const importSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "File is required."),
  format: z.enum(["csv", "json"]),
});

export function ImportModal({
  isOpen,
  onClose,
  modelKey,
  modelName,
}: ImportModalProps) {
  const t = useTranslations("ImportExport");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      format: "csv",
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.importModelData(`/api/admin/models/${modelKey}/import/`, data),
    onSuccess: (data: any) => {
      toast({
        title: t("importSuccessTitle"),
        description: t("importSuccessDescription", { count: data.count || 0 }),
      });
      queryClient.invalidateQueries({ queryKey: ["modelItems", modelKey] });
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("importErrorTitle"),
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof importSchema>) => {
    const formData = new FormData();
    formData.append("file", values.file[0]);
    formData.append("format", values.format);
    importMutation.mutate(formData);
  };

  const handleClose = () => {
    if (importMutation.isPending) return;
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("importTitle", { model: modelName })}</DialogTitle>
          <DialogDescription>{t("importDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("formatLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("selectFormatPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fileLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".csv, .json"
                      {...form.register("file")}
                    />
                  </FormControl>
                  <FormDescription>{t("fileDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={importMutation.isPending}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={importMutation.isPending}>
                {importMutation.isPending ? t("importing") : t("importButton")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
