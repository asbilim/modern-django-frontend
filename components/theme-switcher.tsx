"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SunIcon, MoonIcon, Paintbrush } from "lucide-react";

interface UserProfile {
  preferences: {
    theme?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export function ThemeSwitcher() {
  const t = useTranslations("DashboardLayout");
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: api.getUserProfile,
  });

  const mutation = useMutation({
    mutationFn: (theme: string) =>
      api.updateUserProfile({ preferences: { theme } }),
    onSuccess: (_, theme) => {
      setTheme(theme);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const currentTheme = userProfile?.preferences?.theme || "light";
  const themes = ["light", "dark", "professional", "administrator", "customer"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {currentTheme === "light" && <SunIcon className="h-5 w-5" />}
          {currentTheme === "dark" && <MoonIcon className="h-5 w-5" />}
          {currentTheme !== "light" && currentTheme !== "dark" && (
            <Paintbrush className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => mutation.mutate(theme)}
            className="capitalize">
            {theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
