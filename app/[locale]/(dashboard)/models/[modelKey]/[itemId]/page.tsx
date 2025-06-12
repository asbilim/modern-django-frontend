"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function EditItemPage() {
  const t = useTranslations("ModelListPage");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const modelKey = params.modelKey as string;
  const itemId = params.itemId as string;

  const [fields, setFields] = useState<{ name: string; label: string }[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      if (!session?.accessToken) return;
      const configRes = await adminApi.getAdminConfig(session.accessToken);
      if (!configRes.data) return;
      const model = configRes.data.models[modelKey];
      if (!model) return;
      const cfg = await adminApi.getModelConfig(session.accessToken, model.config_url);
      const f = Object.entries(cfg.data.fields || {}).map(([key, val]: any) => ({
        name: key,
        label: val.label || key,
      }));
      setFields(f);
      const itemRes = await adminApi.getModelItem(session.accessToken, model.api_url, itemId);
      if (itemRes.data) setFormData(itemRes.data);
    }
    load();
  }, [session, modelKey, itemId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;
    const configRes = await adminApi.getAdminConfig(session.accessToken);
    const model = configRes.data.models[modelKey];
    const resp = await adminApi.updateModelItem(session.accessToken, model.api_url, itemId, formData);
    if (!resp.error) {
      toast({ title: t("edit"), description: "OK" });
      router.push(`/models/${modelKey}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t("edit")}</h1>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => (
          <FormInput
            key={f.name}
            label={f.label}
            value={formData[f.name] || ""}
            onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
          />
        ))}
        <FormButton type="submit">{t("save")}</FormButton>
      </form>
    </div>
  );
}
