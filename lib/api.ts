import { dashboardConfig } from "@/lib/config";
import { toast } from "@/hooks/use-toast";

interface FetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Enhanced fetch function with error handling, debugging, and authentication
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { token, params, ...fetchOptions } = options;
  const baseUrl = dashboardConfig.api.baseUrl;

  // Build URL with query parameters if provided
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Prepare the fetch options
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Debug logging in development
  if (dashboardConfig.api.debugMode) {
    console.group(`API Request: ${endpoint}`);
    console.log("URL:", url);
    console.log("Method:", finalOptions.method || "GET");
    console.log("Headers:", Object.fromEntries(headers.entries()));
    if (finalOptions.body) {
      console.log(
        "Body:",
        finalOptions.body instanceof FormData
          ? "FormData"
          : typeof finalOptions.body === "string"
          ? JSON.parse(finalOptions.body)
          : finalOptions.body
      );
    }
    console.groupEnd();
  }

  try {
    const response = await fetch(url, finalOptions);
    let data: T | null = null;

    // Try to parse the response as JSON
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      try {
        data = await response.json();
      } catch (e) {
        // If parsing fails, leave data as null
        console.error("Failed to parse JSON response", e);
      }
    }

    // Debug logging in development
    if (dashboardConfig.api.debugMode) {
      console.group(`API Response: ${endpoint}`);
      console.log("Status:", response.status);
      console.log("Data:", data);
      console.groupEnd();
    }

    // Handle error responses
    if (!response.ok) {
      const error = new Error(
        data && typeof data === "object" && "detail" in data
          ? String(data.detail)
          : `API Error: ${response.status} ${response.statusText}`
      );

      return {
        data: null,
        error,
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    // Handle network errors
    if (dashboardConfig.api.debugMode) {
      console.error("API Network Error:", error);
    }

    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      status: 0, // 0 indicates network error
    };
  }
}

/**
 * Admin API client with typed methods for common operations
 */
export const adminApi = {
  /**
   * Get the admin configuration with available models
   */
  getAdminConfig: async (token: string) => {
    return apiFetch<any>("/api/admin/", { token });
  },

  /**
   * Get configuration for a specific model
   */
  getModelConfig: async (token: string, configUrl: string) => {
    // If configUrl is a full URL, extract the path
    const url = configUrl.startsWith("http")
      ? new URL(configUrl).pathname
      : configUrl;

    return apiFetch<any>(url, { token });
  },

  /**
   * Get a list of items for a model
   */
  getModelList: async (
    token: string,
    modelUrl: string,
    params?: Record<string, string>
  ) => {
    // If modelUrl is a full URL, extract the path
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    return apiFetch<any>(url, { token, params });
  },

  /**
   * Get a single model item by ID
   */
  getModelItem: async (
    token: string,
    modelUrl: string,
    id: string | number
  ) => {
    // If modelUrl is a full URL, extract the path
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    return apiFetch<any>(`${url}${id}/`, { token });
  },

  /**
   * Create a new model item
   */
  createModelItem: async (
    token: string,
    modelUrl: string,
    data: Record<string, any>
  ) => {
    // If modelUrl is a full URL, extract the path
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    return apiFetch<any>(url, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  },

  /**
   * Update an existing model item
   */
  updateModelItem: async (
    token: string,
    modelUrl: string,
    id: string | number,
    data: Record<string, any>
  ) => {
    // If modelUrl is a full URL, extract the path
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    return apiFetch<any>(`${url}${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    });
  },

  /**
   * Delete a model item
   */
  deleteModelItem: async (
    token: string,
    modelUrl: string,
    id: string | number
  ) => {
    // If modelUrl is a full URL, extract the path
    const url = modelUrl.startsWith("http")
      ? new URL(modelUrl).pathname
      : modelUrl;

    return apiFetch<void>(`${url}${id}/`, {
      method: "DELETE",
      token,
    });
  },
};
