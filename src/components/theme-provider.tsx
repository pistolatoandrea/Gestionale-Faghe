"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// Tema forzato su "dark" (stile midnight): niente toggle per ora, ma resta
// pronto per abilitare un cambio tema in futuro rimuovendo forcedTheme.
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
