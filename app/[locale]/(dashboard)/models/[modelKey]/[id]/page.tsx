"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ModelForm } from "@/components/model-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditModelPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const modelKey = params.modelKey as string;
  const itemId = params.id as string;

  const {
    data: modelConfig,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useQuery({
    queryKey: ["modelConfig", modelKey],
    queryFn: () => api.getModelConfig(`/api/admin/models/${modelKey}/config/`),
    enabled: status === "authenticated",
  });

  const {
    data: initialData,
    isLoading: isLoadingData,
    error: errorData,
  } = useQuery({
    queryKey: ["modelItem", modelKey, itemId],
    queryFn: () => api.getModelItem(`/api/admin/models/${modelKey}/`, itemId),
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const isLoading = isLoadingConfig || isLoadingData;
  const error = errorConfig || errorData;

  if (isLoading || status === "loading") {
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
    return <div className="text-destructive">{error.message}</div>;
  }

  if (!modelConfig || !initialData) {
    return <div>{t("loadModelDataFailed", { modelName: modelKey })}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t("editTitle", {
          modelName: modelConfig.verbose_name,
          id: itemId,
        })}
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
