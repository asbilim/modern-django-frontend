"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

type IconName = keyof typeof LucideIcons;

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  fallback?: IconName;
}

export function DynamicIcon({
  name,
  fallback = "FileIcon",
  className,
  ...props
}: DynamicIconProps) {
  // Convert kebab-case or snake_case to PascalCase for Lucide icons
  const formatIconName = (str: string): string => {
    return str
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  };

  const iconName = formatIconName(name);
  const formattedIconName = iconName.endsWith("Icon")
    ? iconName
    : (`${iconName}Icon` as IconName);

  // Try to get the icon by the formatted name, fallback if not found
  const Icon = (LucideIcons[formattedIconName as IconName] ||
    LucideIcons[fallback] ||
    LucideIcons.FileIcon) as LucideIcon;

  return <Icon className={cn("", className)} {...props} />;
}
