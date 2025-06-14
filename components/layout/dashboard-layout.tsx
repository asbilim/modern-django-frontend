"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  MoonIcon,
  SunIcon,
  MenuIcon,
  LogOutIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { useTheme } from "next-themes";

// Sidebar animation variants
const sidebarVariants: Variants = {
  expanded: {
    width: "240px",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  collapsed: {
    width: "72px",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Sidebar item animation variants
const itemVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: "block",
    transition: { duration: 0.2, delay: 0.1 },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transitionEnd: { display: "none" },
    transition: { duration: 0.2 },
  },
};

// Logo animation variants
const logoVariants: Variants = {
  expanded: {
    width: "auto",
    transition: { duration: 0.3 },
  },
  collapsed: {
    width: "32px",
    transition: { duration: 0.3 },
  },
};

interface ModelInfo {
  app_label: string;
  model_name: string;
  verbose_name: string;
  verbose_name_plural: string;
  category: string;
  frontend_config: {
    icon?: string;
    color?: string;
    description?: string;
    include_in_dashboard?: boolean;
  };
  api_url: string;
}

interface AdminConfig {
  models: Record<string, ModelInfo>;
  categories: Record<string, string[]>;
  frontend_options: {
    site_name: string;
    logo_url: string;
    favicon: string;
  };
}

interface UserProfile {
  preferences: {
    theme?: string;
    navbar_style?: string;
    sidebar_collapsed?: boolean;
  };
  [key: string]: any;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const t = useTranslations("DashboardLayout");
  const { setTheme } = useTheme();

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: adminConfig } = useQuery<AdminConfig>({
    queryKey: ["adminConfig"],
    queryFn: api.getAdminConfig,
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
  });

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: api.getUserProfile,
    enabled: !!session,
  });

  const preferencesMutation = useMutation({
    mutationFn: (prefs: Partial<UserProfile["preferences"]>) =>
      api.updateUserProfile({ preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update preferences",
        description: error.message,
      });
    },
  });

  // Derived state from queries
  const theme = userProfile?.preferences?.theme || "light";
  const siteName = adminConfig?.frontend_options?.site_name || "Dashboard";
  const logoUrl =
    adminConfig?.frontend_options?.logo_url || "/default-logo.png";
  const navbarStyle = userProfile?.preferences?.navbar_style || "modern";

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    // Set initial sidebar state from user preferences or mobile status
    const collapsed = isMobile ?? userProfile?.preferences?.sidebar_collapsed;
    setSidebarCollapsed(!!collapsed);
  }, [userProfile, isMobile]);

  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    if (!isMobile) {
      preferencesMutation.mutate({ sidebar_collapsed: newCollapsedState });
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
    toast({
      title: t("signOutSuccessTitle"),
      description: t("signOutSuccessDescription"),
    });
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        data-style={navbarStyle}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col z-30",
          isSidebarCollapsed ? "items-center" : "items-start"
        )}>
        <div className="h-16 flex items-center px-4 justify-between w-full">
          <motion.div
            variants={logoVariants}
            initial={false}
            animate={isSidebarCollapsed ? "collapsed" : "expanded"}
            className="overflow-hidden flex items-center">
            <img src={logoUrl} alt={siteName} className="h-8 w-8" />
            <motion.span
              variants={itemVariants}
              initial={false}
              animate={isSidebarCollapsed ? "collapsed" : "expanded"}
              className="ml-3 font-semibold text-lg">
              {siteName}
            </motion.span>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isSidebarCollapsed ? "" : "rotate-180"
              )}
            />
          </Button>
        </div>

        <ScrollArea className="flex-1 w-full py-4">
          <nav className="px-2 space-y-1">
            <Link
              href="/"
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive("/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                isSidebarCollapsed ? "justify-center" : "justify-start"
              )}>
              <DynamicIcon name="home" className="h-5 w-5 flex-shrink-0" />
              <motion.span
                variants={itemVariants}
                initial={false}
                animate={isSidebarCollapsed ? "collapsed" : "expanded"}
                className="ml-3">
                {t("dashboard")}
              </motion.span>
            </Link>

            {adminConfig &&
              Object.entries(adminConfig.categories).map(
                ([category, modelKeys]) => (
                  <div key={category} className="my-2">
                    {!isSidebarCollapsed && (
                      <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                        {category}
                      </h3>
                    )}
                    {modelKeys.map((modelKey) => {
                      const model = adminConfig.models[modelKey];
                      if (!model) return null;
                      const href = `/models/${model.model_name}`;
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive(href)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                            isSidebarCollapsed
                              ? "justify-center"
                              : "justify-start"
                          )}>
                          <DynamicIcon
                            name={model.frontend_config?.icon || "file-text"}
                            className="h-5 w-5 flex-shrink-0"
                          />
                          <motion.span
                            variants={itemVariants}
                            initial={false}
                            animate={
                              isSidebarCollapsed ? "collapsed" : "expanded"
                            }
                            className="ml-3">
                            {model.verbose_name_plural}
                          </motion.span>
                        </Link>
                      );
                    })}
                  </div>
                )
              )}
            <div className="my-2">
              {!isSidebarCollapsed && (
                <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  {t("system")}
                </h3>
              )}
              <Link
                href="/settings"
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/settings")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isSidebarCollapsed ? "justify-center" : "justify-start"
                )}>
                <DynamicIcon
                  name="settings"
                  className="h-5 w-5 flex-shrink-0"
                />
                <motion.span
                  variants={itemVariants}
                  initial={false}
                  animate={isSidebarCollapsed ? "collapsed" : "expanded"}
                  className="ml-3">
                  {t("settings")}
                </motion.span>
              </Link>
            </div>
          </nav>
        </ScrollArea>
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border w-full">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <LayoutSwitcher />
            <motion.div
              variants={itemVariants}
              initial={false}
              animate={isSidebarCollapsed ? "collapsed" : "expanded"}>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sidebar-foreground hover:bg-sidebar-accent">
                <LogOutIcon className="h-5 w-5 mr-2" />
                {t("signOut")}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 border-b bg-background">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-sidebar">
                <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                  <img src={logoUrl} alt={siteName} className="h-8 w-8" />
                  <span className="ml-3 font-semibold text-lg text-sidebar-foreground">
                    {siteName}
                  </span>
                </div>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <nav className="px-2 py-4">
                    <Link
                      href="/"
                      className={cn(
                        "flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors",
                        isActive("/")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}>
                      <DynamicIcon
                        name="home"
                        className="h-5 w-5 flex-shrink-0 mr-3"
                      />
                      {t("dashboard")}
                    </Link>

                    {adminConfig &&
                      Object.entries(adminConfig.categories).map(
                        ([category, modelKeys]) => (
                          <div key={category} className="my-2">
                            <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                              {category}
                            </h3>
                            {modelKeys.map((modelKey) => {
                              const model = adminConfig.models[modelKey];
                              if (!model) return null;
                              const href = `/models/${model.model_name}`;
                              return (
                                <Link
                                  key={href}
                                  href={href}
                                  className={cn(
                                    "flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors",
                                    isActive(href)
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                  )}>
                                  <DynamicIcon
                                    name={
                                      model.frontend_config?.icon || "file-text"
                                    }
                                    className="h-5 w-5 flex-shrink-0 mr-3"
                                  />
                                  {model.verbose_name_plural}
                                </Link>
                              );
                            })}
                          </div>
                        )
                      )}
                    <div className="my-2">
                      <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                        {t("system")}
                      </h3>
                      <Link
                        href="/settings"
                        className={cn(
                          "flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors",
                          isActive("/settings")
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}>
                        <DynamicIcon
                          name="settings"
                          className="h-5 w-5 flex-shrink-0 mr-3"
                        />
                        {t("settings")}
                      </Link>
                    </div>
                  </nav>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
                  <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    <LayoutSwitcher />
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="text-sidebar-foreground hover:bg-sidebar-accent">
                      <LogOutIcon className="h-5 w-5 mr-2" />
                      {t("signOut")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <img src={logoUrl} alt={siteName} className="h-8 w-8 ml-3" />
            <span className="ml-3 font-semibold text-lg">{siteName}</span>
          </div>
          <div className="flex items-center">
            <ThemeSwitcher />
            <LayoutSwitcher />
          </div>
        </div>
      </div>

      <main
        className={cn(
          "flex-1 overflow-y-auto p-6 pt-6",
          isMobile ? "mt-16" : ""
        )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto max-w-7xl">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
