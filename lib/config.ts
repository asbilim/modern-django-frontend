/**
 * Admin Dashboard Configuration
 * Customize these settings to change the appearance and behavior of the dashboard
 */

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

export interface DashboardConfig {
  name: string;
  description: string;
  logoUrl: string;
  favicon: string;
  repositoryUrl: string;
  api: {
    baseUrl: string;
    debugMode: boolean;
  };
  blog: {
    enabled: boolean;
    name: string;
  };
}

export const dashboardConfig: DashboardConfig = {
  name: "Django Modern Admin",
  description: "A modern admin dashboard for Django",
  repositoryUrl: "https://github.com/your-repo/django-modern-admin",
  logoUrl: "/logo.svg",
  favicon: "/favicon.ico",
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/admin",
    debugMode: process.env.NODE_ENV === "development",
  },
  blog: {
    enabled: true,
    name: "Blog",
  },
};
