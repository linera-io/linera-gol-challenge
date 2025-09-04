import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useNavigate } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryProvider } from "@/lib/providers/QueryProvider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: any;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const navigate = useNavigate();

  return (
    <QueryProvider>
      <HeroUIProvider navigate={navigate}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </QueryProvider>
  );
}