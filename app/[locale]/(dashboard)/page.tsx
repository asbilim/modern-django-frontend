"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn, getModelUrl } from "@/lib/utils";
import { useEffect } from "react";

interface Model {
  verbose_name: string;
  api_url: string;
  config_url?: string;
  count?: number;
  key?: string;
  model_name?: string;
  frontend_config?: {
    icon?: string;
    description?: string;
    color?: string;
  };
}

interface AdminConfig {
  models: Record<string, Model>;
  categories: Record<string, string[]>;
  frontend_options: {
    categories: string[];
    icons: string[];
  };
}

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { status } = useSession();
  const t = useTranslations("DashboardPage");
  const router = useRouter();

  const {
    data: adminConfig,
    isLoading,
    error,
  } = useQuery<AdminConfig>({
    queryKey: ["adminConfig"],
    queryFn: api.getAdminConfig,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  // Group models by category
  const modelsByCategory: Record<string, Model[]> = {};

  if (adminConfig?.categories) {
    // First initialize all categories with empty arrays
    Object.keys(adminConfig.categories).forEach((category) => {
      modelsByCategory[category] = [];
    });

    // Then populate models into their categories
    Object.entries(adminConfig.models).forEach(([key, model]) => {
      // Find which category this model belongs to
      for (const [category, modelKeys] of Object.entries(
        adminConfig.categories
      )) {
        if (modelKeys.includes(key)) {
          const modelWithKey = { ...model, key };
          modelsByCategory[category].push(modelWithKey);
          break;
        }
      }
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <div className="space-y-8">
        {Object.entries(modelsByCategory).map(
          ([category, models], categoryIndex) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model, modelIndex) => {
                  const icon = model.frontend_config?.icon || "file";
                  return (
                    <motion.div
                      key={model.api_url}
                      variants={fadeInUpVariants}
                      initial="initial"
                      animate="animate"
                      transition={{
                        duration: 0.5,
                        delay: (categoryIndex * 10 + modelIndex) * 0.05,
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-md bg-primary/10">
                                <DynamicIcon
                                  name={icon}
                                  className="h-5 w-5 text-primary"
                                />
                              </div>
                              <CardTitle className="text-lg">
                                {model.verbose_name}
                              </CardTitle>
                            </div>
                            {model.count !== undefined && (
                              <Badge variant="outline">{model.count}</Badge>
                            )}
                          </div>
                          {model.frontend_config?.description && (
                            <CardDescription className="mt-2">
                              {model.frontend_config.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="h-16 overflow-hidden text-muted-foreground text-sm">
                            {/* Optional additional content */}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <a
                            href={getModelUrl(model.model_name || "unknown")}
                            className="text-primary hover:underline text-sm font-medium">
                            View {model.verbose_name}
                          </a>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-8">
        {[1, 2, 3].map((category) => (
          <div key={category} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((model) => (
                <div key={model} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-24 mt-4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
