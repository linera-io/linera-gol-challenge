import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useNavigate } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DYNAMIC_LIVE_ENVIRONMENT_ID, DYNAMIC_SANDBOX_ENVIRONMENT_ID } from "@/lib/linera/constants";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: any;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const navigate = useNavigate();

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: import.meta.env.PROD ? DYNAMIC_LIVE_ENVIRONMENT_ID : DYNAMIC_SANDBOX_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <QueryProvider>
        <HeroUIProvider navigate={navigate}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </HeroUIProvider>
      </QueryProvider>
    </DynamicContextProvider>
  );
}
