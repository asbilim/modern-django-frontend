"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menu,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  X,
  Settings,
  Home,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  count?: number;
}

interface NavCategoryProps {
  label: string;
  children: React.ReactNode;
}

const sidebarVariants = {
  expanded: { width: 250 },
  collapsed: { width: 70 },
};

const categoryVariants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

const NavItem = ({ icon, label, href, active, count }: NavItemProps) => {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
      )}>
      <DynamicIcon name={icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs">
          {count}
        </span>
      )}
    </a>
  );
};

const NavCategory = ({ label, children }: NavCategoryProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between px-3 py-1 text-muted-foreground hover:text-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        <motion.div
          animate={isOpen ? { rotate: 0 } : { rotate: -90 }}
          transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={categoryVariants}
            className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if it's a mobile screen on mount and when resizing
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      }
    };

    // Initial check
    checkIsMobile();

    // Listen for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-50 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div
          variants={sidebarVariants}
          initial={isSidebarExpanded ? "expanded" : "collapsed"}
          animate={isSidebarExpanded ? "expanded" : "collapsed"}
          className="fixed inset-y-0 left-0 z-20 flex flex-col bg-card border-r">
          <div className="flex h-14 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
              <Menu className="h-5 w-5" />
            </Button>
            <AnimatePresence>
              {isSidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 overflow-hidden">
                  <h1 className="text-xl font-bold">Admin</h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ScrollArea className="flex-1">
            <DesktopSidebar expanded={isSidebarExpanded} />
          </ScrollArea>
        </motion.div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !isMobile && "ml-[70px]",
          !isMobile && isSidebarExpanded && "ml-[250px]"
        )}>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-card px-4 md:px-6">
          <Breadcrumb className="mr-auto">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Actions Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Language Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function DesktopSidebar({ expanded }: { expanded: boolean }) {
  if (!expanded) {
    return (
      <div className="px-2 py-4">
        <div className="flex flex-col items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <a href="/admin">
              <Home className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <a href="/admin/models/user">
              <UserCircle className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <a href="/admin/settings">
              <Settings className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      <NavCategory label="Access Control">
        <NavItem
          icon="user"
          label="Users"
          href="/admin/models/user"
          count={128}
        />
        <NavItem
          icon="shield"
          label="Groups"
          href="/admin/models/group"
          count={8}
        />
      </NavCategory>

      <NavCategory label="Task Management">
        <NavItem
          icon="briefcase"
          label="Projects"
          href="/admin/models/project"
          count={12}
        />
        <NavItem
          icon="check-square"
          label="Tasks"
          href="/admin/models/task"
          count={45}
        />
      </NavCategory>

      <NavCategory label="Configuration">
        <NavItem
          icon="folder"
          label="Categories"
          href="/admin/models/category"
          count={18}
        />
        <NavItem icon="tag" label="Tags" href="/admin/models/tag" count={24} />
      </NavCategory>

      <NavCategory label="Site Settings">
        <NavItem
          icon="mail"
          label="Email Settings"
          href="/admin/models/emailsettings"
          count={1}
        />
        <NavItem
          icon="folder-open"
          label="File Storage"
          href="/admin/models/filestoragesettings"
          count={1}
        />
        <NavItem
          icon="globe"
          label="Site Identity"
          href="/admin/models/siteidentity"
          count={1}
        />
      </NavCategory>
    </div>
  );
}

function MobileSidebar() {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <NavCategory label="Access Control">
            <NavItem
              icon="user"
              label="Users"
              href="/admin/models/user"
              count={128}
            />
            <NavItem
              icon="shield"
              label="Groups"
              href="/admin/models/group"
              count={8}
            />
          </NavCategory>

          <NavCategory label="Task Management">
            <NavItem
              icon="briefcase"
              label="Projects"
              href="/admin/models/project"
              count={12}
            />
            <NavItem
              icon="check-square"
              label="Tasks"
              href="/admin/models/task"
              count={45}
            />
          </NavCategory>

          <NavCategory label="Configuration">
            <NavItem
              icon="folder"
              label="Categories"
              href="/admin/models/category"
              count={18}
            />
            <NavItem
              icon="tag"
              label="Tags"
              href="/admin/models/tag"
              count={24}
            />
          </NavCategory>

          <NavCategory label="Site Settings">
            <NavItem
              icon="mail"
              label="Email Settings"
              href="/admin/models/emailsettings"
              count={1}
            />
            <NavItem
              icon="folder-open"
              label="File Storage"
              href="/admin/models/filestoragesettings"
              count={1}
            />
            <NavItem
              icon="globe"
              label="Site Identity"
              href="/admin/models/siteidentity"
              count={1}
            />
          </NavCategory>
        </div>
      </ScrollArea>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
