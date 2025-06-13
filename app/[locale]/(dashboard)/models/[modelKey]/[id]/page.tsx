"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminApi } from "@/lib/api";
import { ModelForm } from "@/components/model-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditModelPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const modelKey = params.modelKey as string;
  const itemId = params.id as string;

  const [modelConfig, setModelConfig] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const configUrl = `/api/admin/models/${modelKey}/config/`;
      const configResponse = await adminApi.getModelConfig(
        session.accessToken,
        configUrl
      );
      if (configResponse.error) {
        throw new Error(
          `Failed to fetch model config: ${configResponse.error.message}`
        );
      }
      setModelConfig(configResponse.data);

      const itemResponse = await adminApi.getModelItem(
        session.accessToken,
        `/api/admin/models/${modelKey}/`,
        itemId
      );
      if (itemResponse.error) {
        throw new Error(
          `Failed to fetch model item: ${itemResponse.error.message}`
        );
      }
      setInitialData(itemResponse.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [modelKey, itemId, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, fetchData, router]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!modelConfig || !initialData) {
    return <div>Failed to load model data.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t("edit")} {modelConfig.verbose_name}: #{itemId}
      </h1>
      <ModelForm
        modelKey={modelKey}
        modelConfig={modelConfig}
        initialData={initialData}
        itemId={itemId}
      />
    </div>
  );
}
