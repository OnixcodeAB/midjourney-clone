"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
/* export function useTheme() {
  const context = React.useContext(NextThemesProvider.Context);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} */