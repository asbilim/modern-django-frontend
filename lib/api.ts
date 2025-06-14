import { getSession, signOut } from "next-auth/react";
import { dashboardConfig } from "@/lib/config";
import { toast } from "@/hooks/use-toast";

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

export const api = {
  getAdminConfig: () => apiFetch<any>("/api/admin/"),
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
  getUserProfile: () => apiFetch<any>("/api/auth/me/"),
  updateUserProfile: (data: any) =>
    apiFetch<any>("/api/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: (data: any) =>
    apiFetch<any>("/api/auth/me/change-password/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  requestPasswordReset: (email: string) =>
    apiFetch<any>("/api/auth/password_reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  confirmPasswordReset: (data: any) =>
    apiFetch<any>("/api/auth/password_reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  get2FASecret: () => apiFetch<any>("/api/auth/2fa/enable/"),
  verify2FA: (otp: string) =>
    apiFetch<any>("/api/auth/2fa/verify/", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),
  disable2FA: (password: string) =>
    apiFetch<any>("/api/auth/2fa/disable/", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};
