/**
 * Admin Dashboard Configuration
 * Customize these settings to change the appearance and behavior of the dashboard
 */

export const dashboardConfig = {
  // General settings
  name: "Django Modern Admin",
  description: "A powerful and customizable admin dashboard",

  // Branding
  logo: {
    dark: "/logo-dark.svg",
    light: "/logo-light.svg",
  },
  favicon: "/favicon.ico",

  // Theme settings
  theme: {
    defaultTheme: "light", // "light" or "dark"
    enableSystemTheme: true,
  },

  // Layout settings
  layout: {
    sidebarWidth: 280, // in pixels
    contentMaxWidth: 1200, // in pixels
    navigationStyle: "sidebar", // "sidebar" or "horizontal"
  },

  // API settings
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    timeout: 30000, // in milliseconds
    retryCount: 3,
    debugMode: process.env.NODE_ENV === "development",
  },

  // Notification settings
  notifications: {
    position: "top-right", // "top-right", "top-center", "top-left", "bottom-right", "bottom-center", "bottom-left"
    duration: 5000, // in milliseconds
  },

  // Footer settings
  footer: {
    showFooter: true,
    text: "© 2024 Django Modern Admin. All rights reserved.",
  },
};
