"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/blog";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  locale: string;
  selectedCategoryId: string | null;
  onSelectCategory: (id: number | null) => void;
}

export function CategoryList({
  locale,
  selectedCategoryId,
  onSelectCategory,
}: CategoryListProps) {
  const t = useTranslations("BlogPage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.getBlogCategories(locale);
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response && Array.isArray(response.results)) {
          setCategories(response.results);
        } else if (Array.isArray(response)) {
          setCategories(response);
        } else {
          setCategories([]);
          console.error("Invalid categories response format:", response);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError("Failed to load categories");
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [locale]);

  if (isLoading) {
    return <div>{t("loadingCategories")}</div>;
  }

  if (error) {
    return <div className="text-destructive text-sm">{error}</div>;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">{t("categoriesTitle")}</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          onClick={() => onSelectCategory(null)}
          variant={!selectedCategoryId ? "default" : "secondary"}
          className="cursor-pointer">
          {t("allCategories")}
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            variant={
              selectedCategoryId === String(category.id)
                ? "default"
                : "secondary"
            }
            className="cursor-pointer">
            {category.name} ({category.post_count})
          </Badge>
        ))}
      </div>
    </div>
  );
}
