"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      if (!session?.accessToken) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await adminApi.getAdminConfig(session.accessToken);
        if (response.error) {
          throw new Error(
            `Failed to fetch admin configuration: ${response.error.message}`
          );
        }

        setAdminConfig(response.data as AdminConfig);
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
    }

    if (session) {
      fetchData();
    }
  }, [session, status, toast, router]);

  if (isLoading || status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <h2 className="text-xl font-semibold mb-4">Available Models</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminConfig &&
          Object.entries(adminConfig.models).map(([key, model]) => (
            <div
              key={key}
              className="p-6 border border-gray-200 hover:border-black transition-colors">
              <h3 className="text-lg font-bold">{model.name}</h3>
              <p className="text-gray-600 mb-4">{model.count} items</p>
              <a
                href={`/models/${key}`}
                className="text-black hover:underline mt-4 inline-block">
                View {model.name}
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
