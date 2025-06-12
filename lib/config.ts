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
  navigation: NavigationItem[];
  api: {
    baseUrl: string;
    debugMode: boolean;
  };
}

export const dashboardConfig: DashboardConfig = {
  name: "Modern Admin",
  description: "A modern admin dashboard for Django",
  logoUrl: "/logo.svg", // Path to your logo
  favicon: "/favicon.ico",
  navigation: [
    {
      name: "Dashboard",
      href: "/",
      icon: "home",
    },
    {
      name: "Users",
      href: "/models/user",
      icon: "user",
    },
    {
      name: "Groups",
      href: "/models/group",
      icon: "users",
    },
    {
      name: "Projects",
      href: "/models/project",
      icon: "briefcase",
    },
    {
      name: "Tasks",
      href: "/models/task",
      icon: "check-square",
    },
    {
      name: "Categories",
      href: "/models/category",
      icon: "folder",
    },
    {
      name: "Tags",
      href: "/models/tag",
      icon: "tag",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: "settings",
    },
  ],
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    debugMode: process.env.NODE_ENV === "development",
  },
};
