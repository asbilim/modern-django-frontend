export interface Author {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  post_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  is_active: boolean;
  post_count: number;
  meta_title: string;
  meta_description: string;
  subcategories: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  post_count: number;
}

export interface PostListItem {
  id: string; // uuid
  title: string;
  slug: string;
  excerpt: string;
  author: Author;
  categories: Category[];
  tags: Tag[];
  featured_image: string | null;
  is_featured: boolean;
  is_sticky: boolean;
  published_at: string; // ISO 8601 date string
  reading_time: number;
  view_count: number;
  likes_count: number;
  comments_count: number;
  absolute_url: string;
}

export interface PostDetail extends PostListItem {
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string | null;
  previous_post: {
    id: string;
    title: string;
    slug: string;
  } | null;
  next_post: {
    id: string;
    title: string;
    slug: string;
  } | null;
  related_posts: {
    id: string;
    title: string;
    slug: string;
  }[];
}

export interface Comment {
  id: string; // uuid
  content: string;
  author_name: string;
  author_avatar_url?: string;
  created_at: string; // ISO 8601 date string
  replies: Comment[];
  parent: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BlogStats {
  total_posts: number;
  total_comments: number;
  total_categories: number;
  total_tags: number;
}
