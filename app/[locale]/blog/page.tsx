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

export default function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations("BlogPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const currentSearch = searchParams.get("search") || "";
      const currentCategory = searchParams.get("category");

      let postsData;
      if (currentCategory) {
        postsData = await api.getPostsByCategory(locale, currentCategory);
      } else {
        postsData = await api.getBlogPosts(locale, { search: currentSearch });
      }

      setPosts(postsData.results);
      setIsLoading(false);
    };

    fetchPosts();
  }, [searchParams, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    // Category selection should be cleared when performing a new search
    params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectCategory = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    // Search should be cleared when selecting a new category
    params.delete("search");
    setSearchTerm("");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <CategoryList
            locale={locale}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </aside>
        <main className="md:col-span-3">
          {isLoading ? (
            <p>{t("loading")}</p>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg overflow-hidden">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">
                      <a href={`/blog/${post.slug}`}>{post.title}</a>
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {post.excerpt}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <span>
                        {post.author.first_name} {post.author.last_name}
                      </span>
                      <span className="mx-2">&bull;</span>
                      <span>
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t("noResults")}</p>
          )}
        </main>
      </div>
    </div>
  );
}
