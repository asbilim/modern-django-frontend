"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { adminApi } from "@/lib/api";
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
  const { data: session } = useSession();
  const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: initialData || {},
  });

  const fetchRelationOptions = useCallback(async () => {
    if (!session?.accessToken) return;
    const fields = Object.values(modelConfig.fields);
    for (const field of fields) {
      if (
        (field.ui_component === "foreignkey_select" ||
          field.ui_component === "manytomany_select") &&
        field.related_model
      ) {
        const response = await adminApi.getModelList(
          session.accessToken,
          field.related_model.api_url
        );
        if (response.data?.results) {
          setRelationOptions((prev) => ({
            ...prev,
            [field.name]: response.data.results.map((item: any) => ({
              value: item.id,
              label:
                item.name || item.title || item.username || `ID: ${item.id}`,
            })),
          }));
        }
      }
    }
  }, [session, modelConfig.fields]);

  useEffect(() => {
    fetchRelationOptions();
  }, [fetchRelationOptions]);

  const onSubmit = async (data: Record<string, any>) => {
    if (!session?.accessToken) return;
    setIsSaving(true);

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof FileList) {
        if (value.length > 0) {
          formData.append(key, value[0]);
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    const api_url = `/api/admin/models/${modelKey}/`;
    let response;
    if (itemId) {
      response = await adminApi.updateModelItem(
        session.accessToken,
        api_url,
        itemId,
        formData
      );
    } else {
      response = await adminApi.createModelItem(
        session.accessToken,
        api_url,
        formData
      );
    }

    setIsSaving(false);

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error.message,
      });
    } else {
      toast({
        title: "Success",
        description: `Item ${itemId ? "updated" : "created"} successfully.`,
      });
      router.push(`/models/${modelKey}`);
    }
  };

  const renderField = (fieldName: string, fieldConfig: FieldConfig) => {
    return (
      <FormField
        control={form.control}
        name={fieldName}
        key={fieldName}
        render={({ field }) => {
          let component;
          switch (fieldConfig.ui_component) {
            case "textarea":
              component = (
                <FormTextarea
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  {...field}
                />
              );
              break;
            case "checkbox":
              component = (
                <div className="flex items-center space-x-2 my-4">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormLabel>{fieldConfig.verbose_name}</FormLabel>
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
                />
              );
              break;
            case "select":
              component = (
                <FormSelect
                  label={fieldConfig.verbose_name}
                  options={fieldConfig.choices || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  required={fieldConfig.required}
                />
              );
              break;
            case "foreignkey_select":
              component = (
                <FormSelect
                  label={fieldConfig.verbose_name}
                  options={relationOptions[fieldName] || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  required={fieldConfig.required}
                  placeholder={`Select a ${fieldConfig.verbose_name}`}
                />
              );
              break;
            case "image_upload":
              component = (
                <FormFileUpload
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  value={field.value}
                  onRemove={() => form.setValue(fieldName, null)}
                  accept="image/*"
                  {...form.register(fieldName)}
                />
              );
              break;
            case "file_upload":
              component = (
                <FormFileUpload
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  value={field.value}
                  onRemove={() => form.setValue(fieldName, null)}
                  {...form.register(fieldName)}
                />
              );
              break;
            case "json_field":
              component = (
                <FormJsonEditor
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  value={field.value}
                  onChange={field.onChange}
                />
              );
              break;
            case "textfield":
            default:
              component = (
                <FormInput
                  label={fieldConfig.verbose_name}
                  required={fieldConfig.required}
                  {...field}
                  value={field.value || ""}
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

  const nonTranslatedFields = Object.entries(modelConfig.fields).filter(
    ([fieldName, fieldConfig]) =>
      fieldName !== "id" && !fieldConfig.is_translation && fieldConfig.editable
  );

  const translationFields = Object.entries(modelConfig.fields)
    .filter(([_, fieldConfig]) => fieldConfig.is_translation)
    .reduce((acc, [fieldName, fieldConfig]) => {
      const baseName = fieldName.substring(0, fieldName.lastIndexOf("_"));
      const lang = fieldName.substring(fieldName.lastIndexOf("_") + 1);
      if (!acc[baseName]) {
        acc[baseName] = { baseConfig: null, translations: {} };
      }
      acc[baseName].translations[lang] = { fieldName, fieldConfig };
      return acc;
    }, {} as Record<string, any>);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        encType="multipart/form-data">
        <div className="space-y-6">
          {nonTranslatedFields.map(([fieldName, fieldConfig]) =>
            renderField(fieldName, fieldConfig)
          )}
        </div>

        {Object.keys(translationFields).length > 0 && (
          <Tabs defaultValue="en">
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="de">German</TabsTrigger>
              <TabsTrigger value="fr">French</TabsTrigger>
            </TabsList>
            {Object.entries(translationFields).map(([baseName, group]) => {
              const baseFieldConfig =
                modelConfig.fields[baseName] ||
                group.translations.en.fieldConfig;
              return (
                <div key={baseName} className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    {baseFieldConfig.verbose_name}
                  </h3>
                  <TabsContent value="en">
                    {group.translations.en &&
                      renderField(
                        group.translations.en.fieldName,
                        group.translations.en.fieldConfig
                      )}
                  </TabsContent>
                  <TabsContent value="de">
                    {group.translations.de &&
                      renderField(
                        group.translations.de.fieldName,
                        group.translations.de.fieldConfig
                      )}
                  </TabsContent>
                  <TabsContent value="fr">
                    {group.translations.fr &&
                      renderField(
                        group.translations.fr.fieldName,
                        group.translations.fr.fieldConfig
                      )}
                  </TabsContent>
                </div>
              );
            })}
          </Tabs>
        )}

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : t("save")}
        </Button>
      </form>
    </Form>
  );
}
