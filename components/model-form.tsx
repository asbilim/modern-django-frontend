"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDatePicker } from "@/components/ui/form-datepicker";
import { FormSelect } from "@/components/ui/form-select";
import { FormFileUpload } from "@/components/ui/form-file-upload";
import { FormJsonEditor } from "@/components/ui/form-json-editor";
import { FormMultiSelect } from "@/components/ui/form-multi-select";
import { AiGenerateButton } from "@/components/ai-generate-button";
import { FormMarkdownEditor } from "@/components/ui/form-markdown-editor";
import { FormUuidInput } from "@/components/ui/form-uuid-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FieldConfig {
  name: string;
  verbose_name: string;
  type: string;
  ui_component: string;
  required: boolean;
  max_length?: number;
  help_text?: string;
  is_translation: boolean;
  editable: boolean;
  choices?: { value: string; label: string }[];
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
  admin_config: any;
  permissions: any;
}

interface ModelFormProps {
  modelKey: string;
  modelConfig: ModelConfig;
  initialData?: Record<string, any>;
  itemId?: string;
}

export function ModelForm({
  modelKey,
  modelConfig,
  initialData,
  itemId,
}: ModelFormProps) {
  const t = useTranslations("ModelListPage");
  const router = useRouter();
  const { toast } = useToast();
  const { status } = useSession();
  const queryClient = useQueryClient();

  const defaultValues = React.useMemo(() => {
    const defaults: Record<string, any> = {};
    if (modelConfig && modelConfig.fields) {
      for (const fieldName in modelConfig.fields) {
        const config = modelConfig.fields[fieldName];
        if (config.ui_component === "checkbox") {
          defaults[fieldName] = false;
        } else if (config.ui_component === "manytomany_select") {
          defaults[fieldName] = [];
        } else if (config.type === "JSONField") {
          defaults[fieldName] = null;
        } else {
          defaults[fieldName] = "";
        }
      }
    }
    return { ...defaults, ...(initialData || {}) };
  }, [modelConfig, initialData]);

  const form = useForm({
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, any> | FormData) => {
      const api_url = `/api/admin/models/${modelKey}/`;
      if (itemId) {
        return api.updateModelItem(api_url, itemId, data);
      }
      return api.createModelItem(api_url, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Item ${itemId ? "updated" : "created"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["modelItems", modelKey] });
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] }); // Invalidate dashboard counts
      router.push(`/models/${modelKey}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: Record<string, any>) => {
    const preparedData: Record<string, any> = {};
    let hasFiles = false;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const fieldConfig = modelConfig.fields[key];

        if (
          fieldConfig &&
          (fieldConfig.ui_component === "datetime_picker" ||
            fieldConfig.ui_component === "date_picker") &&
          value
        ) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            preparedData[key] = date.toISOString();
          } else {
            preparedData[key] = value;
          }
        } else if (value instanceof FileList && value.length > 0) {
          preparedData[key] = value;
          hasFiles = true;
        } else {
          preparedData[key] = value;
        }
      }
    }

    if (hasFiles) {
      const formData = new FormData();
      for (const key in preparedData) {
        const value = preparedData[key];
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, String(item)));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
      mutation.mutate(formData);
    } else {
      // Remove FileList objects if no file was selected
      const jsonPayload = { ...preparedData };
      for (const key in jsonPayload) {
        if (jsonPayload[key] instanceof FileList) {
          delete jsonPayload[key];
        }
      }
      mutation.mutate(jsonPayload);
    }
  };

  const renderField = (fieldName: string, fieldConfig: FieldConfig) => {
    if (
      fieldConfig.related_model &&
      (fieldConfig.ui_component === "foreignkey_select" ||
        fieldConfig.ui_component === "manytomany_select")
    ) {
      return (
        <RelationField
          fieldName={fieldName}
          fieldConfig={fieldConfig}
          formControl={form.control}
          disabled={!fieldConfig.editable}
        />
      );
    }

    // Determine the component based on type and ui_component hint
    let componentType = fieldConfig.ui_component;
    if (fieldConfig.type === "JSONField") {
      componentType = "json_editor";
    } else if (fieldConfig.type === "ManyToManyField") {
      componentType = "manytomany_select";
    }

    return (
      <FormField
        control={form.control}
        name={fieldName}
        key={fieldName}
        render={({ field }) => {
          let component;

          switch (componentType) {
            case "uuid":
              component = (
                <FormUuidInput
                  label={fieldConfig.verbose_name}
                  disabled={!fieldConfig.editable}
                  {...field}
                />
              );
              break;
            case "textarea":
              component = (
                <FormTextarea
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  disabled={!fieldConfig.editable}
                  {...field}
                />
              );
              break;
            case "checkbox":
              component = (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id={fieldName}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!fieldConfig.editable}
                  />
                  <label
                    htmlFor={fieldName}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {fieldConfig.verbose_name}
                  </label>
                </div>
              );
              break;
            case "datetime_picker":
            case "date_picker":
              component = (
                <FormDatePicker
                  label={fieldConfig.verbose_name}
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={field.onChange}
                  required={fieldConfig.required}
                  disabled={!fieldConfig.editable}
                />
              );
              break;
            case "select":
              component = (
                <FormSelect
                  label={fieldConfig.verbose_name}
                  options={fieldConfig.choices || []}
                  onChange={field.onChange}
                  value={field.value}
                  required={fieldConfig.required}
                  disabled={!fieldConfig.editable}
                />
              );
              break;
            case "foreignkey_select": // This is now handled by RelationField, but keeping as fallback
            case "manytomany_select": // This is now handled by RelationField, but keeping as fallback
              component = <p>Loading options...</p>;
              break;
            case "image_upload":
            case "file_upload":
              component = (
                <FormFileUpload
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  value={field.value}
                  accept={
                    componentType === "image_upload" ? "image/*" : undefined
                  }
                  onRemove={() => form.setValue(fieldName, null)}
                  disabled={!fieldConfig.editable}
                  {...form.register(fieldName)}
                />
              );
              break;
            case "json_editor":
              component = (
                <FormJsonEditor
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!fieldConfig.editable}
                />
              );
              break;
            case "markdown_editor":
              component = (
                <FormMarkdownEditor
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  disabled={!fieldConfig.editable}
                  value={field.value}
                  onChange={field.onChange}
                />
              );
              break;
            default:
              component = (
                <FormInput
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  disabled={!fieldConfig.editable}
                  {...field}
                />
              );
          }
          return (
            <FormItem>
              <FormControl>{component}</FormControl>
              {fieldConfig.help_text && (
                <FormDescription>{fieldConfig.help_text}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  // Main form rendering logic
  const nonTranslationFields = Object.entries(modelConfig.fields).filter(
    ([fieldName, config]) =>
      fieldName !== "id" && !config.is_translation && config.editable
  );
  const translationFields = Object.entries(modelConfig.fields).filter(
    ([, config]) => config.is_translation && config.editable
  );
  const languages = [
    ...new Set(
      translationFields.map(([, config]) => config.name.split("_").pop())
    ),
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <AiGenerateButton modelConfig={modelConfig} form={form} />
        </div>

        <div className="p-6 border rounded-lg space-y-6">
          {nonTranslationFields.map(([fieldName, fieldConfig]) => (
            <React.Fragment key={fieldName}>
              {renderField(fieldName, fieldConfig)}
            </React.Fragment>
          ))}
        </div>

        {translationFields.length > 0 && (
          <Tabs defaultValue={languages[0] || "en"}>
            <TabsList>
              {languages.map((lang) => (
                <TabsTrigger key={lang} value={lang!}>
                  {lang!.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            {languages.map((lang) => (
              <TabsContent key={lang} value={lang!} className="pt-4">
                <div className="p-6 border rounded-lg space-y-6">
                  {translationFields
                    .filter(([, config]) => config.name.endsWith(`_${lang}`))
                    .map(([fieldName, fieldConfig]) => (
                      <React.Fragment key={fieldName}>
                        {renderField(fieldName, fieldConfig)}
                      </React.Fragment>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : t("save")}
        </Button>
      </form>
    </Form>
  );
}

// A new component to handle fetching relation options
function RelationField({
  fieldName,
  fieldConfig,
  formControl,
  disabled,
}: {
  fieldName: string;
  fieldConfig: FieldConfig;
  formControl: any;
  disabled?: boolean;
}) {
  const { status } = useSession();
  const { data: options, isLoading } = useQuery({
    queryKey: ["relationOptions", fieldConfig.related_model?.api_url],
    queryFn: () =>
      api.getModelList(fieldConfig.related_model!.api_url).then((res) =>
        res.results.map((item: any) => {
          let label = `ID: ${item.id}`;
          if (item.name) {
            label = item.name;
          } else if (item.title) {
            label = item.title;
          } else if (item.username) {
            label = item.username;
          }
          return {
            value: item.id.toString(),
            label,
          };
        })
      ),
    enabled: status === "authenticated" && !!fieldConfig.related_model?.api_url,
  });

  if (isLoading) {
    return <p>Loading options for {fieldConfig.verbose_name}...</p>;
  }

  return (
    <FormField
      control={formControl}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          {fieldConfig.ui_component === "foreignkey_select" ? (
            <FormSelect
              label={fieldConfig.verbose_name}
              options={options || []}
              onChange={field.onChange}
              value={String(field.value || "")}
              required={fieldConfig.required}
              disabled={disabled}
            />
          ) : (
            <FormMultiSelect
              label={fieldConfig.verbose_name}
              options={options || []}
              onChange={field.onChange}
              value={field.value || []}
              required={fieldConfig.required}
              disabled={disabled}
            />
          )}
          {fieldConfig.help_text && (
            <FormDescription>{fieldConfig.help_text}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
