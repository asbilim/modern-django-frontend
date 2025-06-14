"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard } from "lucide-react";

interface UserProfile {
  preferences: {
    navbar_style?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export function LayoutSwitcher() {
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: api.getUserProfile,
  });

  const mutation = useMutation({
    mutationFn: (layout: string) =>
      api.updateUserProfile({ preferences: { navbar_style: layout } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const layouts = ["modern", "professional", "customer"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {layouts.map((layout) => (
          <DropdownMenuItem
            key={layout}
            onClick={() => mutation.mutate(layout)}
            className="capitalize">
            {layout}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
