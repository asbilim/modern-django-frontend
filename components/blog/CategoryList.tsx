"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/blog";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  locale: string;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryList({
  locale,
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  const t = useTranslations("BlogPage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await api.getBlogCategories(locale);
        setCategories(response.results);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [locale]);

  if (isLoading) {
    return <div>{t("loadingCategories")}</div>;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">{t("categoriesTitle")}</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          onClick={() => onSelectCategory(null)}
          variant={!selectedCategory ? "default" : "secondary"}
          className="cursor-pointer">
          {t("allCategories")}
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            variant={
              selectedCategory === category.slug ? "default" : "secondary"
            }
            className="cursor-pointer">
            {category.name} ({category.post_count})
          </Badge>
        ))}
      </div>
    </div>
  );
}
