"use client";

import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { PostListItem } from "@/types/blog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CategoryList } from "@/components/blog/CategoryList";

export default function BlogPage() {
  const t = useTranslations("BlogPage");

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-bold text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <hr className="my-8" />
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">{t("comingSoon")}</p>
      </div>
    </div>
  );
}
