import initLinera, { Faucet, Client, Wallet, Application } from "@linera/client";
import type { Wallet as DynamicWallet } from "@dynamic-labs/sdk-react-core";
import { DynamicSigner } from "./dynamic-signer";

export interface LineraProvider {
  client: Client;
  wallet: Wallet;
  faucet: Faucet;
  address: string;
  chainId: string;
}

export class LineraAdapter {
  private static instance: LineraAdapter | null = null;
  private provider: LineraProvider | null = null;
  private application: Application | null = null;
  private previousApplications: Application[] = [];
  private wasmInitPromise: Promise<unknown> | null = null;
  private connectPromise: Promise<LineraProvider> | null = null;
  private onConnectionChange?: () => void;
  private notificationCallbacks: Set<(notification: any) => void> = new Set();

  private constructor() {}

  static getInstance(): LineraAdapter {
    if (!LineraAdapter.instance) LineraAdapter.instance = new LineraAdapter();
    return LineraAdapter.instance;
  }

  async connect(dynamicWallet: DynamicWallet, rpcUrl: string): Promise<LineraProvider> {
    if (this.provider) return this.provider;
    if (this.connectPromise) return this.connectPromise;

    if (!dynamicWallet) {
      throw new Error("Dynamic wallet is required for Linera connection");
    }

    try {
      this.connectPromise = (async () => {
        const { address } = dynamicWallet;
        console.log("🔗 Connecting with Dynamic wallet:", address);

        try {
          if (!this.wasmInitPromise) this.wasmInitPromise = initLinera();
          await this.wasmInitPromise;
          console.log("✅ Linera WASM modules initialized successfully");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log("mesage of the error", msg);
          if (msg.includes("storage is already initialized")) {
            console.warn("⚠️ Linera storage already initialized; continuing without re-init");
          } else {
            throw e;
          }
        }

        const faucet = await new Faucet(rpcUrl);
        const wallet = await faucet.createWallet();
        const chainId = await faucet.claimChain(wallet, address);

        const signer = await new DynamicSigner(dynamicWallet);
        const client = await new Client(wallet, signer);
        console.log("✅ Using Linera chain: ", chainId);

        client.onNotification((notification : any) => {
          let newBlock = notification.reason.NewBlock;
          if (!newBlock) return;
          
          // Notify all registered callbacks
          this.notificationCallbacks.forEach(callback => {
            try {
              callback(notification);
            } catch (error) {
              console.error("Error in notification callback:", error);
            }
          });
        });

        this.provider = {
          client,
          wallet,
          faucet,
          chainId,
          address: dynamicWallet.address,
        };
        console.log("🔄 Notifying connection state change (chain connected)");
        this.onConnectionChange?.();
        return this.provider;
      })();

      const provider = await this.connectPromise;
      return provider;
    } catch (error) {
      console.error("Failed to connect to Linera:", error);
      throw new Error(
        `Failed to connect to Linera network: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      this.connectPromise = null;
    }
  }

  async setApplications(appId: string, previousAppIds: string[]) {
    if (!this.provider) throw new Error("Not connected to Linera");

    const application = await this.provider.client.frontend().application(appId);

    if (!application) throw new Error("Failed to get application");
    this.application = application;
    console.log("✅ Linera application set successfully: ", appId);

    const applications = []
    for (const appId of previousAppIds) {
      const application = await this.provider.client.frontend().application(appId);
      if (!application) throw new Error("Failed to get previous application");
      applications.push(application);
    }
    this.previousApplications = applications;
    console.log("✅ Previous Linera application set successfully: ", previousAppIds);

    console.log("🔄 Notifying connection state change (app set)");
    this.onConnectionChange?.();
  }

  async queryApplication<T>(query: object): Promise<T> {
    if (!this.application) throw new Error("Application not set");

    const result = await this.application.query(JSON.stringify(query));
    const response = JSON.parse(result);

    console.log("✅ Linera application queried successfully: ", response);
    return response;
  }

  async queryCurrentAndPreviousApplications<T>(query: object): Promise<T[]> {
    if (!this.application) throw new Error("Application not set");

    const responses = [];
    const result = await this.application.query(JSON.stringify(query));
    const response = JSON.parse(result);
    responses.push(response);

    for (const application of this.previousApplications) {
        const result = await application.query(JSON.stringify(query));
        const response = JSON.parse(result);
        responses.push(response);
    }

    console.log("✅ Current and previous Linera applications queried successfully: ", responses);
    return responses;
  }

  getProvider(): LineraProvider {
    if (!this.provider) throw new Error("Provider not set");
    return this.provider;
  }

  getFaucet(): Faucet {
    if (!this.provider?.faucet) throw new Error("Faucet not set");
    return this.provider.faucet;
  }

  getWallet(): Wallet {
    if (!this.provider?.wallet) throw new Error("Wallet not set");
    return this.provider.wallet;
  }

  getApplication(): Application {
    if (!this.application) throw new Error("Application not set");
    return this.application;
  }

  isChainConnected(): boolean {
    return this.provider !== null;
  }

  isApplicationSet(): boolean {
    return this.application !== null;
  }

  onConnectionStateChange(callback: () => void): void {
    this.onConnectionChange = callback;
  }

  offConnectionStateChange(): void {
    this.onConnectionChange = undefined;
  }

  getAddress(): string {
    if (!this.provider) throw new Error("Provider not set");
    return this.provider.address;
  }

  reset(): void {
    this.application = null;
    this.provider = null;
    this.connectPromise = null;
    this.onConnectionChange?.();
  }

  onNewBlockNotification(callback: (notification: any) => void): () => void {
    this.notificationCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }
}

// Export singleton instance
export const lineraAdapter = LineraAdapter.getInstance();
