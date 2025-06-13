"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { adminApi } from "@/lib/api";
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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

export default function ModelListPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const modelKey = params.modelKey as string;
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [modelItems, setModelItems] = useState<ModelItem[]>([]);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ModelItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      setModelConfig(null);

      if (!session?.accessToken) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch admin configuration
        const configResponse = await adminApi.getAdminConfig(
          session.accessToken
        );
        if (configResponse.error) {
          throw new Error(
            `Failed to fetch admin configuration: ${configResponse.error.message}`
          );
        }

        const config = configResponse.data as AdminConfig;
        setAdminConfig(config);

        // Check if the requested model exists
        const model = Object.values(config.models).find(
          (m) => m.model_name === modelKey
        );
        if (!model) {
          throw new Error(`Model ${modelKey} not found`);
        }

        // Fetch model configuration
        const configUrl = `/api/admin/models/${modelKey}/config/`;
        const modelConfigResponse = await adminApi.getModelConfig(
          session.accessToken,
          configUrl
        );
        if (modelConfigResponse.error) {
          throw new Error(
            `Failed to fetch model configuration: ${modelConfigResponse.error.message}`
          );
        }
        setModelConfig(modelConfigResponse.data as ModelConfig);

        // Fetch model items
        const modelResponse = await adminApi.getModelList(
          session.accessToken,
          model.api_url,
          { page: page.toString(), page_size: PAGE_SIZE.toString() }
        );
        if (modelResponse.error) {
          throw new Error(
            `Failed to fetch model data: ${modelResponse.error.message}`
          );
        }

        setModelItems(modelResponse.data?.results || []);
        setTotalItems(modelResponse.data?.count || 0);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [modelKey, session, toast]
  );

  const handleDelete = async () => {
    if (!itemToDelete || !session?.accessToken || !model?.api_url) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleteResponse = await adminApi.deleteModelItem(
        session.accessToken,
        model.api_url,
        itemToDelete.id
      );

      if (deleteResponse.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete item: ${deleteResponse.error.message}`,
        });
      } else {
        toast({
          title: "Success",
          description: `Item ${itemToDelete.id} was deleted successfully.`,
        });
        setModelItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        setTotalItems((prev) => prev - 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the item.",
      });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session) {
      fetchData(currentPage);
    }
  }, [session, status, router, fetchData, currentPage]);

  const model = adminConfig
    ? Object.values(adminConfig.models).find((m) => m.model_name === modelKey)
    : undefined;
  const modelIcon = model?.frontend_config?.icon || "file";
  const displayFields = modelConfig?.admin_config?.list_display || [];

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchData(currentPage)}>
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-md bg-primary/10">
            <DynamicIcon name={modelIcon} className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {model?.verbose_name || modelKey}
          </h1>
          <Badge variant="outline" className="ml-2">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button
          onClick={() => router.push(getModelUrl(modelKey, "create"))}
          disabled={isLoading}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("createNew")}
        </Button>
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

                      if (
                        fieldConfig?.type &&
                        fieldConfig.type.includes("Date")
                      ) {
                        cellValue = formatDate(cellValue);
                      }

                      const displayValue =
                        cellValue === null ||
                        cellValue === undefined ||
                        cellValue === ""
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
                      <AlertDialog>
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
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
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
                              onClick={() => {
                                setItemToDelete(item);
                                handleDelete();
                              }}
                              disabled={isDeleting}>
                              {isDeleting ? "Deleting..." : t("delete")}
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
                      handlePageChange(currentPage - 1);
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
                        handlePageChange(i + 1);
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
                      handlePageChange(currentPage + 1);
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
    </div>
  );
}
