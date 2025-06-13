"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { dashboardConfig } from "@/lib/config";
import {
  MoonIcon,
  SunIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";

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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [siteName, setSiteName] = useState(dashboardConfig.name);
  const [logoUrl, setLogoUrl] = useState(dashboardConfig.logoUrl);
  const [navbarStyle, setNavbarStyle] = useState("modern");

  // Initialize theme and sidebar state from localStorage
  useEffect(() => {
    setIsMounted(true);

    // Theme initialization
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const storedName = localStorage.getItem("siteName");
    if (storedName) setSiteName(storedName);
    const storedLogo = localStorage.getItem("logoUrl");
    if (storedLogo) setLogoUrl(storedLogo);
    const storedStyle = localStorage.getItem("navbarStyle");
    if (storedStyle) setNavbarStyle(storedStyle);

    // Sidebar state initialization
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (savedSidebarState === "true") {
      setIsCollapsed(true);
    }

    // Check if mobile view
    const checkIfMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (isMobile) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Toggle sidebar expand/collapse
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    localStorage.setItem("sidebarCollapsed", String(newCollapsedState));
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Sign out logic here
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Check if a navigation item is active
  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        data-style={navbarStyle}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col z-30",
          isCollapsed ? "items-center" : "items-start"
        )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 justify-between w-full">
          <motion.div
            variants={logoVariants}
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            className="overflow-hidden flex items-center">
            <img src={logoUrl} alt={siteName} className="h-8 w-8" />
            <motion.span
              variants={itemVariants}
              initial={false}
              animate={isCollapsed ? "collapsed" : "expanded"}
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
                isCollapsed ? "" : "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation Links */}
        <ScrollArea className="flex-1 w-full py-4">
          <nav className="px-2 space-y-1">
            {dashboardConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  isCollapsed ? "justify-center" : "justify-start"
                )}>
                <DynamicIcon
                  name={item.icon}
                  className="h-5 w-5 flex-shrink-0"
                />
                <motion.span
                  variants={itemVariants}
                  initial={false}
                  animate={isCollapsed ? "collapsed" : "expanded"}
                  className="ml-3">
                  {item.name}
                </motion.span>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border w-full">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-sidebar-foreground hover:bg-sidebar-accent">
              {theme === "light" ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </Button>
            <motion.div
              variants={itemVariants}
              initial={false}
              animate={isCollapsed ? "collapsed" : "expanded"}>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sidebar-foreground hover:bg-sidebar-accent">
                <LogOutIcon className="h-5 w-5 mr-2" />
                Sign out
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
                    {dashboardConfig.navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}>
                        <DynamicIcon
                          name={item.icon}
                          className="h-5 w-5 flex-shrink-0 mr-3"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
                  <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="text-sidebar-foreground hover:bg-sidebar-accent">
                      {theme === "light" ? (
                        <MoonIcon className="h-5 w-5" />
                      ) : (
                        <SunIcon className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="text-sidebar-foreground hover:bg-sidebar-accent">
                      <LogOutIcon className="h-5 w-5 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <img src={logoUrl} alt={siteName} className="h-8 w-8 ml-3" />
            <span className="ml-3 font-semibold text-lg">{siteName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground">
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto p-6 pt-6",
          isMobileView ? "mt-16" : ""
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
