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

export default function BlogPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = useTranslations("BlogPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const selectedCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const currentSearch = searchParams.get("search") || "";
        const currentCategoryId = searchParams.get("categoryId");

        let postsData;
        if (currentCategoryId) {
          postsData = await api.getPostsByCategory(locale, currentCategoryId);
        } else {
          postsData = await api.getBlogPosts(locale, { search: currentSearch });
        }

        // Handle the new API response wrapper
        if (
          postsData &&
          (postsData as any).success &&
          Array.isArray((postsData as any).data)
        ) {
          setPosts((postsData as any).data);
        } else if (postsData && Array.isArray((postsData as any).results)) {
          // Fallback for old paginated format
          setPosts((postsData as any).results);
        } else if (Array.isArray(postsData)) {
          // Fallback for direct array response
          setPosts(postsData);
        } else {
          setPosts([]);
          console.error(
            "Invalid response format from blog posts API:",
            postsData
          );
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load blog posts");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
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
    params.delete("categoryId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectCategory = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set("categoryId", String(categoryId));
    } else {
      params.delete("categoryId");
    }
    // Search should be cleared when selecting a new category
    params.delete("search");
    setSearchTerm("");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
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
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />
        </aside>
        <main className="md:col-span-3">
          {isLoading ? (
            <p>{t("loading")}</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : posts && posts.length > 0 ? (
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
                      <a href={`/blog/${post.id}`}>{post.title}</a>
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
