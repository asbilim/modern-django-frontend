"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { PlusIcon, Trash2, Pencil, AlertCircle } from "lucide-react";
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

interface Model {
  name: string;
  api_url: string;
  config_url: string;
  count: number;
  frontend_config?: {
    icon?: string;
    description?: string;
    color?: string;
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
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const modelKey = params.modelKey as string;
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [modelItems, setModelItems] = useState<ModelItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ModelItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!session?.accessToken) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch admin configuration
      const configResponse = await adminApi.getAdminConfig(session.accessToken);
      if (configResponse.error) {
        throw new Error(
          `Failed to fetch admin configuration: ${configResponse.error.message}`
        );
      }

      const config = configResponse.data as AdminConfig;
      setAdminConfig(config);

      // Check if the requested model exists
      const model = config.models[modelKey];
      if (!model) {
        throw new Error(`Model ${modelKey} not found`);
      }

      // Fetch model items
      const modelResponse = await adminApi.getModelList(
        session.accessToken,
        model.api_url
      );
      if (modelResponse.error) {
        throw new Error(
          `Failed to fetch model data: ${modelResponse.error.message}`
        );
      }

      setModelItems(modelResponse.data?.results || []);
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
  }, [modelKey, session, toast]);

  const handleDelete = async () => {
    if (
      !itemToDelete ||
      !session?.accessToken ||
      !adminConfig?.models[modelKey]?.api_url
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleteResponse = await adminApi.deleteModelItem(
        session.accessToken,
        adminConfig.models[modelKey].api_url,
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
      fetchData();
    }
  }, [session, status, router, fetchData]);

  const model = adminConfig?.models[modelKey];
  const modelIcon = model?.frontend_config?.icon || "file";

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
        <Button variant="outline" onClick={fetchData}>
          Try Again
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
          <h1 className="text-2xl font-bold">{model?.name || modelKey}</h1>
          <Badge variant="outline" className="ml-2">
            {modelItems.length} item{modelItems.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button
          onClick={() => router.push(getModelUrl(modelKey, "create"))}
          disabled={isLoading}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-sm text-muted-foreground">
                  ID
                </th>
                <th className="p-3 text-left font-medium text-sm text-muted-foreground">
                  Name / Title
                </th>
                <th className="p-3 text-left font-medium text-sm text-muted-foreground">
                  Created At
                </th>
                <th className="p-3 text-left font-medium text-sm text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modelItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground">
                    No items found
                  </td>
                </tr>
              ) : (
                modelItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-sm">{item.id}</td>
                    <td className="p-3 text-sm font-medium">
                      <a
                        href={getModelUrl(modelKey, item.id)}
                        className="hover:text-primary hover:underline">
                        {item.name || item.title || "-"}
                      </a>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(getModelUrl(modelKey, item.id))
                          }>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this item? This
                                action cannot be undone.
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
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
