"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import {
  PlusIcon,
  Trash2,
  Pencil,
  AlertCircle,
  MoreHorizontal,
  Upload,
  Download,
} from "lucide-react";
import { getModelUrl, formatDate } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ImportModal } from "@/components/import-modal";

const PAGE_SIZE = 15;

interface Model {
  verbose_name: string;
  api_url: string;
  config_url?: string;
  count?: number;
  model_name?: string;
  frontend_config?: {
    icon?: string;
    description?: string;
    color?: string;
  };
}

interface FieldConfig {
  name: string;
  verbose_name: string;
  type: string;
  ui_component: string;
  required: boolean;
  max_length?: number;
  help_text?: string;
  is_translation: boolean;
  related_model?: {
    app_label: string;
    model_name: string;
    api_url: string;
  };
}

interface ModelConfig {
  model_name: string;
  verbose_name: string;
  verbose_name_plural: string;
  fields: Record<string, FieldConfig>;
  admin_config: {
    list_display?: string[];
    search_fields?: string[];
  };
  permissions: {
    add: boolean;
    change: boolean;
    delete: boolean;
    view: boolean;
  };
  frontend_config: {
    icon?: string;
    category?: string;
    description?: string;
    tree_view?: boolean;
    parent_field?: string;
  };
}

interface AdminConfig {
  models: Record<string, Model>;
  frontend_options: any;
}

interface ModelItem {
  id: string | number;
  [key: string]: any;
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
}

export default function ModelListPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const modelKey = params.modelKey as string;
  const { status } = useSession();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<ModelItem | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const { data: adminConfig } = useQuery<AdminConfig>({
    queryKey: ["adminConfig"],
    queryFn: api.getAdminConfig,
    enabled: status === "authenticated",
  });

  const model = adminConfig?.models
    ? Object.values(adminConfig.models).find((m) => m.model_name === modelKey)
    : undefined;

  const {
    data: modelConfig,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useQuery<ModelConfig>({
    queryKey: ["modelConfig", modelKey],
    queryFn: () => api.getModelConfig(`/api/admin/models/${modelKey}/config/`),
    enabled: !!model,
  });

  const {
    data: modelData,
    isLoading: isLoadingItems,
    error: errorItems,
  } = useQuery<PaginatedResponse<ModelItem>>({
    queryKey: ["modelItems", modelKey, currentPage],
    queryFn: () =>
      api.getModelList(model!.api_url, {
        page: currentPage.toString(),
        page_size: PAGE_SIZE.toString(),
      }),
    enabled: !!model,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) =>
      api.deleteModelItem(model!.api_url, id),
    onSuccess: (_, deletedId) => {
      toast({
        title: "Success",
        description: `Item ${deletedId} was deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["modelItems", modelKey] });
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
    },
    onError: (error: Error, deletedId) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete item ${deletedId}: ${error.message}`,
      });
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!model) return;
    try {
      const response = await api.exportModelData(model.api_url, format);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${modelKey}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} file is downloading.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message,
      });
    }
  };

  const isLoading = isLoadingConfig || isLoadingItems;
  const error = errorConfig || errorItems;
  const modelItems = modelData?.results || [];
  const totalItems = modelData?.count || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  if (isLoading || status === "loading") {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">Error</h2>
        </div>
        <p className="text-destructive mb-4">{error.message}</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["modelItems", modelKey, currentPage],
            })
          }>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  const modelIcon = model?.frontend_config?.icon || "file";
  const displayFields = modelConfig?.admin_config?.list_display || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-primary/10">
            <DynamicIcon name={modelIcon} className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {modelConfig?.verbose_name || modelKey}
          </h1>
          <Badge variant="outline" className="ml-2">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                {t("exportAsCsv")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                {t("exportAsJson")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t("import")}
          </Button>

          <Button
            onClick={() => router.push(getModelUrl(modelKey, "create"))}
            disabled={deleteMutation.isPending}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("createNew")}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {displayFields.map((fieldName) => (
                  <th
                    key={fieldName}
                    className="p-3 text-left font-medium text-sm text-muted-foreground">
                    {modelConfig?.fields[fieldName]?.verbose_name || fieldName}
                  </th>
                ))}
                <th className="p-3 text-left font-medium text-sm text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modelItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayFields.length + 1}
                    className="p-4 text-center text-muted-foreground">
                    {t("noItems")}
                  </td>
                </tr>
              ) : (
                modelItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors">
                    {displayFields.map((fieldName, index) => {
                      const fieldConfig = modelConfig?.fields[fieldName];
                      let cellValue: any = item[fieldName];
                      if (fieldConfig?.type?.includes("Date")) {
                        cellValue = formatDate(cellValue);
                      }
                      const displayValue =
                        cellValue === null || cellValue === ""
                          ? "-"
                          : String(cellValue);
                      if (index === 0) {
                        return (
                          <td
                            key={fieldName}
                            className="p-3 text-sm font-medium">
                            <a
                              href={getModelUrl(modelKey, item.id)}
                              className="hover:text-primary hover:underline">
                              {displayValue}
                            </a>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={fieldName}
                          className="p-3 text-sm text-muted-foreground">
                          {displayValue}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right">
                      <AlertDialog
                        open={!!itemToDelete && itemToDelete.id === item.id}
                        onOpenChange={(open) => !open && setItemToDelete(null)}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(getModelUrl(modelKey, item.id))
                              }>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={() => setItemToDelete(item)}
                                className="text-destructive focus:text-destructive">
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                {t("delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("deleteTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("deleteConfirm")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={deleteMutation.isPending}>
                              {deleteMutation.isPending
                                ? "Deleting..."
                                : t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        modelKey={modelKey}
        modelName={modelConfig?.verbose_name_plural || modelKey}
      />
    </div>
  );
}
