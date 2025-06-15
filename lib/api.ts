import { getSession, signOut } from "next-auth/react";
import { dashboardConfig } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import {
  PaginatedResponse,
  PostListItem,
  PostDetail,
  Category,
  Tag,
  Author,
  Comment,
  BlogStats,
} from "@/types/blog";

const REFRESH_ATTEMPT_LIMIT = 3;
const REFRESH_ATTEMPT_WINDOW_MS = 30000;

const refreshManager = {
  refreshPromise: null as Promise<string> | null,
  failureCount: 0,
  lastFailureTimestamp: 0,

  async handleRefresh(): Promise<string> {
    const now = Date.now();

    if (now - this.lastFailureTimestamp > REFRESH_ATTEMPT_WINDOW_MS) {
      this.failureCount = 0;
    }

    if (this.failureCount >= REFRESH_ATTEMPT_LIMIT) {
      throw new Error("Token refresh attempt limit reached.");
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefreshToken()
        .then((newAccessToken) => {
          this.failureCount = 0;
          return newAccessToken;
        })
        .catch((err) => {
          this.failureCount++;
          this.lastFailureTimestamp = Date.now();
          throw err;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  },

  async performRefreshToken(): Promise<string> {
    const session = await getSession();
    if (!session?.refreshToken) {
      throw new Error("No refresh token available.");
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token from API");
    }

    const { access } = await res.json();
    if (!access) {
      throw new Error("No new access token in refresh response");
    }

    // Note: getSession() does not automatically update the session.
    // The new token will be used for subsequent requests in this flow,
    // but the session in React components might not be updated until the next session poll.
    // This is generally fine as we are managing the token flow here.
    return access;
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const getApiHeaders = async (locale?: string) => {
  const session = await getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }
  if (locale) {
    headers["Accept-Language"] = locale;
  }
  return headers;
};

const apiRequest = async <T>(
  method: string,
  endpoint: string,
  body?: any,
  locale?: string
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getApiHeaders(locale);

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed: ${response.statusText} - ${JSON.stringify(
          errorData
        )}`
      );
    }
    return response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  let session = await getSession();
  let token = session?.accessToken;

  if (isRetry && !token) {
    // If it's a retry, we must have a token from the refresh flow.
    // If not, something is wrong, so we bail.
    throw new Error("Authentication failed after token refresh.");
  }

  const url = `${dashboardConfig.api.baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = { ...options, headers };

  const response = await fetch(url, finalOptions);

  if (response.status === 401 && !isRetry) {
    try {
      const newAccessToken = await refreshManager.handleRefresh();
      // Manually update the token for the retry
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      return await apiFetch<T>(endpoint, { ...options, headers }, true);
    } catch (refreshError) {
      // If refresh fails (including too many retries), sign out
      await signOut({ redirect: false });
      window.location.href = "/login";
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorDetail);
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return (await response.json()) as T;
  }
  // For DELETE requests or other non-JSON responses
  return null as T;
}

async function apiFileFetch(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  let session = await getSession();
  let token = session?.accessToken;

  if (isRetry && !token) {
    throw new Error("Authentication failed after token refresh.");
  }

  const url = `${dashboardConfig.api.baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions: RequestInit = { ...options, headers };

  const response = await fetch(url, finalOptions);

  if (response.status === 401 && !isRetry) {
    try {
      const newAccessToken = await refreshManager.handleRefresh();
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      return await apiFileFetch(endpoint, { ...options, headers }, true);
    } catch (refreshError) {
      await signOut({ redirect: false });
      window.location.href = "/login";
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorDetail);
  }

  return response;
}

const getBlogPosts = async (
  locale: string,
  params: { page?: string; search?: string; ordering?: string } = {}
): Promise<PaginatedResponse<PostListItem>> => {
  const queryParams = new URLSearchParams(params).toString();
  return apiFetch(`/api/blog/posts/?${queryParams}`, {
    headers: { "Accept-Language": locale },
  });
};

const getBlogPost = async (locale: string, id: string): Promise<PostDetail> => {
  return apiFetch(`/api/blog/posts/${id}/`, {
    headers: { "Accept-Language": locale },
  });
};

const getBlogCategories = async (
  locale: string
): Promise<PaginatedResponse<Category>> => {
  return apiFetch("/api/blog/categories/", {
    headers: { "Accept-Language": locale },
  });
};

const getBlogStats = async (locale: string): Promise<BlogStats> => {
  return apiFetch("/api/blog/stats/", {
    headers: { "Accept-Language": locale },
  });
};

const getPostsByCategory = async (
  locale: string,
  categoryId: string | number
): Promise<PaginatedResponse<PostListItem>> => {
  return apiFetch(`/api/blog/categories/${categoryId}/posts/`, {
    headers: { "Accept-Language": locale },
  });
};

export const api = {
  getAdminConfig: () => apiRequest("GET", "/api/admin/config/"),
  getDashboardStats: () => apiFetch<any>("/api/admin/dashboard-stats/"),
  getModelConfig: (configUrl: string) => {
    const url = configUrl.startsWith("http")
      ? new URL(configUrl).pathname
      : configUrl;
    return apiFetch<any>(url);
  },
  getModelList: (modelUrl: string, params?: Record<string, string>) => {
    const url = new URL(
      `${dashboardConfig.api.baseUrl}${
        modelUrl.startsWith("http") ? new URL(modelUrl).pathname : modelUrl
      }`
    );
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return apiFetch<any>(`${url.pathname}${url.search}`);
  },
  getAllModelItems: async (modelUrl: string) => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    let results: any[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await apiFetch<any>(`${url}?page=${page}`);
      results = results.concat(response.results);
      // The backend should provide a `next` field, which is null when there are no more pages.
      hasNext = response.next !== null;
      page++;
    }
    return results;
  },
  getModelItem: (modelUrl: string, id: string | number) => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;
    return apiFetch<any>(`${url}${id}/`);
  },
  createModelItem: (modelUrl: string, data: Record<string, any> | FormData) => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;
    return apiFetch<any>(url, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  updateModelItem: (
    modelUrl: string,
    id: string | number,
    data: Record<string, any> | FormData
  ) => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;
    return apiFetch<any>(`${url}${id}/`, {
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  deleteModelItem: (modelUrl: string, id: string | number) => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;
    return apiFetch<void>(`${url}${id}/`, { method: "DELETE" });
  },

  // Import/Export
  exportModelData: (modelUrl: string, format: "csv" | "json") => {
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;
    return apiFileFetch(`${url}export/?format=${format}`);
  },
  importModelData: (importUrl: string, data: FormData) => {
    const url = importUrl.startsWith("http")
      ? new URL(importUrl).pathname
      : importUrl;
    return apiFetch<any>(url, {
      method: "POST",
      body: data,
    });
  },

  // Auth and User Management
  getUserProfile: () => apiRequest("GET", "/api/auth/me/"),
  updateUserProfile: (data: any) => apiRequest("PATCH", "/api/auth/me/", data),
  changePassword: (data: any) =>
    apiRequest("POST", "/api/auth/me/change-password/", JSON.stringify(data)),
  requestPasswordReset: (email: string) =>
    apiRequest("POST", "/api/auth/password_reset/", JSON.stringify({ email })),
  confirmPasswordReset: (data: any) =>
    apiRequest(
      "POST",
      "/api/auth/password_reset/confirm/",
      JSON.stringify(data)
    ),
  get2FASecret: () => apiRequest("GET", "/api/auth/2fa/enable/"),
  verify2FA: (otp: string) =>
    apiRequest("POST", "/api/auth/2fa/verify/", JSON.stringify({ otp })),
  disable2FA: (password: string) =>
    apiRequest("POST", "/api/auth/2fa/disable/", JSON.stringify({ password })),
  importModelItems: (modelKey: string, data: FormData) => {
    return apiRequest("POST", `/api/admin/models/${modelKey}/import/`, data);
  },
  getBlogPosts: (
    locale: string,
    params?: { search?: string; categoryId?: string }
  ): Promise<PaginatedResponse<PostListItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("category", params.categoryId);
    return apiRequest(
      "GET",
      `/api/blog/posts/?${searchParams.toString()}`,
      null,
      locale
    );
  },
  getBlogPost: (locale: string, id: string): Promise<PostDetail> => {
    return apiRequest("GET", `/api/blog/posts/${id}/`, null, locale);
  },
  getBlogCategories: (locale: string): Promise<PaginatedResponse<Category>> => {
    return apiRequest("GET", "/api/blog/categories/", null, locale);
  },
  getBlogStats: (locale: string) => {
    return apiRequest("GET", "/api/blog/stats/", null, locale);
  },
  getPostsByCategory: (
    locale: string,
    categoryId: string
  ): Promise<PaginatedResponse<PostListItem>> => {
    return apiRequest(
      "GET",
      `/api/blog/categories/${categoryId}/posts/`,
      null,
      locale
    );
  },
  getPostComments: (
    locale: string,
    postId: string
  ): Promise<PaginatedResponse<Comment>> => {
    return apiRequest(
      "GET",
      `/api/blog/posts/${postId}/comments/`,
      null,
      locale
    );
  },
  createPostComment: (
    postId: string,
    data: {
      content: string;
      parent?: string | null;
      author_name?: string;
      author_email?: string;
    }
  ) => {
    return apiRequest("POST", `/api/blog/posts/${postId}/comments/`, data);
  },
};
