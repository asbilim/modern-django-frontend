"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelKey: string;
  modelName: string;
}

interface IFormInput {
  file: FileList;
  format: "csv" | "json";
}

export function ImportModal({
  isOpen,
  onClose,
  modelKey,
  modelName,
}: ImportModalProps) {
  const t = useTranslations("ImportExport");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, reset } = useForm<IFormInput>();

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.importModelItems(modelKey, data),
    onSuccess: (result: { count: number }) => {
      toast({
        title: t("importSuccessTitle"),
        description: t("importSuccessDescription", { count: result.count }),
      });
      queryClient.invalidateQueries({ queryKey: ["modelItems", modelKey] });
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
      onClose();
      reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("importErrorTitle"),
        description: error.message,
      });
    },
  });

  const onSubmit = (data: IFormInput) => {
    if (!data.file || data.file.length === 0) {
      toast({
        variant: "destructive",
        title: t("importErrorTitle"),
        description: "Please select a file to import.",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("format", data.format);
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("importTitle", { model: modelName })}</DialogTitle>
          <DialogDescription>{t("importDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">{t("formatLabel")}</Label>
            <Controller
              name="format"
              control={control}
              defaultValue="csv"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectFormatPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">{t("fileLabel")}</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.json"
              {...register("file")}
            />
            <p className="text-sm text-muted-foreground">
              {t("fileDescription")}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("importing") : t("importButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
