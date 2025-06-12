"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

interface Model {
  name: string;
  api_url: string;
  config_url: string;
  count: number;
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
        <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{model?.name || modelKey}</h1>
        <Button
          onClick={() => router.push(`/models/${modelKey}/create`)}
          disabled={isLoading}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Name / Title</th>
              <th className="p-4 text-left font-semibold">Created At</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
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
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/models/${modelKey}/${item.id}`)}>
                  <td className="p-4">{item.id}</td>
                  <td className="p-4">{item.name || item.title || "-"}</td>
                  <td className="p-4">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/models/${modelKey}/${item.id}`);
                        }}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            !model?.api_url ||
                            !session?.accessToken ||
                            !confirm(
                              "Are you sure you want to delete this item?"
                            )
                          ) {
                            return;
                          }
                          const deleteResponse = await adminApi.deleteModelItem(
                            session.accessToken,
                            model.api_url,
                            item.id
                          );
                          if (deleteResponse.error) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: `Failed to delete item: ${deleteResponse.error.message}`,
                            });
                          } else {
                            toast({
                              title: "Item deleted",
                              description: `Item ${item.id} was deleted successfully.`,
                            });
                            setModelItems((prev) =>
                              prev.filter((i) => i.id !== item.id)
                            );
                          }
                        }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
