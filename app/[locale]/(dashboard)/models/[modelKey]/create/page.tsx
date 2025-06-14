"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ModelForm } from "@/components/model-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateModelPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const modelKey = params.modelKey as string;

  const {
    data: modelConfig,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["modelConfig", modelKey],
    queryFn: () => api.getModelConfig(`/api/admin/models/${modelKey}/config/`),
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  if (!modelConfig) {
    return <div>{t("loadModelConfigFailed")}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t("createTitle", { modelName: modelConfig.verbose_name })}
      </h1>
      <ModelForm modelKey={modelKey} modelConfig={modelConfig} />
    </div>
  );
}
