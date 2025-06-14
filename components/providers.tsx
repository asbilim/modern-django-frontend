"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
