import * as linera from "@linera/client";
import { PrivateKey } from "@linera/signer";
import { ethers } from "ethers";

export interface LineraBoard {
  size: number;
  liveCells: Array<{ x: number; y: number }>;
}

export interface Puzzle {
  id: string;
  title: string;
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard";
  size: number;
  minimalSteps: number;
  maximalSteps: number;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface WalletInfo {
  chainId: string;
  createdAt: string;
}

export class LineraService {
  private static instance: LineraService | null = null;
  private client: linera.Client | null = null;
  private backend: linera.Application | null = null;
  private initialized = false;
  private walletInfo: WalletInfo | null = null;

  // Game of Life app Id
  private static readonly GOL_APP_ID =
    "cc918f81c841b28498ca0c6c3c1c131b9d8f1257c40639de984aac3212edaab8";
  // Testnet-conway faucet
  private static readonly FAUCET_URL = "https://faucet.testnet-conway.linera.net/";

  private constructor() {}

  static getInstance(): LineraService {
    if (!this.instance) {
      this.instance = new LineraService();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("Initializing Linera service...");

      // Initialize Linera WebAssembly
      await linera.default();

      // TODO: Try to read existing wallet from browser storage
      let wallet;
      // TODO: Support connecting to an already existing signer.
      const randomWallet = ethers.Wallet.createRandom();
      if (!randomWallet.mnemonic) {
        throw new Error("Failed to generate mnemonic");
      }
      let signer = PrivateKey.fromMnemonic(randomWallet.mnemonic.phrase);
      const owner = await signer.address();

      // if (!wallet) {
      console.log("No wallet found, creating new wallet from faucet...");

      // Create faucet and get new wallet
      const faucet = new linera.Faucet(LineraService.FAUCET_URL);
      wallet = await faucet.createWallet();
      const chainId = await faucet.claimChain(wallet, owner);

      // Create client with wallet and signer
      this.client = new linera.Client(wallet, signer);

      // Store wallet info
      localStorage.setItem("linera_chain_id", chainId);
      localStorage.setItem("linera_wallet_created", new Date().toISOString());

      this.walletInfo = {
        chainId,
        createdAt: new Date().toISOString(),
      };

      console.log("Wallet created successfully. Chain ID:", chainId);
      // } else {
      //   console.log("Found existing wallet");

      //   // Create client with existing wallet IMPORTANT: await is needed here because new Client returns a promise
      //   this.client = await new linera.Client(wallet, signer);

      //   // Get stored wallet info
      //   const storedChainId = localStorage.getItem("linera_chain_id");
      //   const storedCreatedAt = localStorage.getItem("linera_wallet_created");

      //   if (storedChainId) {
      //     this.walletInfo = {
      //       chainId: storedChainId,
      //       createdAt: storedCreatedAt || new Date().toISOString(),
      //     };
      //   }
      // }

      console.log("Got client", await this.client);
      this.backend = await (await this.client)
        .frontend()
        .application(LineraService.GOL_APP_ID);
      console.log("Got backend", this.backend);

      this.initialized = true;
      console.log("Linera service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Linera service:", error);
      throw error;
    }
  }

  async checkWallet(): Promise<WalletInfo | null> {
    try {
      await linera.default();
      // TODO: Bring back once recovering wallets from
      // the storage is implemented.
      // const wallet = await linera.Wallet.read();

      // if (!wallet) {
      //   return null;
      // }

      const storedChainId = localStorage.getItem("linera_chain_id");
      const createdAt = localStorage.getItem("linera_wallet_created");

      if (!storedChainId || !createdAt) {
        return null;
      }

      return {
        chainId: storedChainId,
        createdAt: createdAt,
      };
    } catch (error) {
      console.error("Failed to check wallet:", error);
      return null;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.client || !this.backend) {
      throw new Error("Linera service not initialized");
    }
  }

  async visualizeBoard(board: LineraBoard): Promise<string> {
    await this.ensureInitialized();

    const query = {
      query: `
        query PrintBoard($board: BoardInput!) {
          printBoard(board: $board)
        }
      `,
      variables: { board },
    };

    const response = await this.backend!.query(JSON.stringify(query));
    const result = JSON.parse(response);

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data.printBoard;
  }

  async advanceBoard(
    board: LineraBoard,
    steps: number = 1
  ): Promise<LineraBoard> {
    await this.ensureInitialized();

    const query = {
      query: `
        query AdvanceBoard($board: BoardInput!, $steps: Int!) {
          advanceBoard(board: $board, steps: $steps) {
            size
            liveCells {
              x
              y
            }
          }
        }
      `,
      variables: { board, steps },
    };

    const response = await this.backend!.query(JSON.stringify(query));
    const result = JSON.parse(response);

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data.advanceBoard;
  }

  async validateSolution(
    board: LineraBoard,
    puzzleId: string
  ): Promise<ValidationResult> {
    await this.ensureInitialized();

    const query = {
      query: `
        query ValidateSolution($board: BoardInput!, $puzzleId: String!) {
          validateSolution(board: $board, puzzleId: $puzzleId) {
            isValidAfterSteps
            errorMessage
          }
        }
      `,
      variables: { board, puzzleId },
    };

    const response = await this.backend!.query(JSON.stringify(query));
    const result = JSON.parse(response);

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const validation = result.data.validateSolution;

    return {
      isValid: validation.isValidAfterSteps !== null,
      errorMessage: validation.errorMessage,
    };
  }

  async submitSolution(puzzleId: string, board: LineraBoard): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const mutation = {
        query: `
          mutation SubmitSolution($puzzleId: String!, $board: BoardInput!) {
            submitSolution(puzzleId: $puzzleId, board: $board)
          }
        `,
        variables: { puzzleId, board },
      };

      const response = await this.backend!.query(JSON.stringify(mutation));
      const result = JSON.parse(response);

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to submit solution:", error);
      return false;
    }
  }

  async getPuzzle(puzzleId: string): Promise<Puzzle | null> {
    await this.ensureInitialized();
    if (!this.backend) {
      throw new Error("Backend not initialized");
    }

    try {
      const query = {
        query: `
          query GetPuzzle($puzzleId: String!) {
            puzzle(puzzleId: $puzzleId) {
              title
              summary
              difficulty
              size
              minimalSteps
              maximalSteps
            }
          }
        `,
        variables: { puzzleId },
      };

      const response = await this.backend.query(JSON.stringify(query));
      console.log("[GOL] Got response from getPuzzle", response);
      const result = JSON.parse(response);

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      if (!result.data?.puzzle) {
        console.warn(`No puzzle data found for ID: ${puzzleId}`);
        return null;
      }

      const puzzleData = result.data.puzzle;
      console.log("[GOL] Parsed puzzle data:", puzzleData);
      
      // Ensure difficulty is valid, default to "Easy" if not
      const validDifficulties = ["Easy", "Medium", "Hard"];
      const difficulty = validDifficulties.includes(puzzleData.difficulty) 
        ? puzzleData.difficulty as "Easy" | "Medium" | "Hard"
        : "Easy";
      
      if (puzzleData.difficulty !== difficulty) {
        console.warn(`Invalid difficulty value: ${puzzleData.difficulty}, defaulting to Easy`);
      }

      return {
        id: puzzleId,
        title: puzzleData.title || "Untitled Puzzle",
        summary: puzzleData.summary || "No description available",
        difficulty: difficulty,
        size: puzzleData.size || 7,
        minimalSteps: puzzleData.minimalSteps || 0,
        maximalSteps: puzzleData.maximalSteps || 100,
      };
    } catch (error) {
      console.error("Failed to get puzzle:", error);
      return null;
    }
  }

  onNotification(callback: (notification: any) => void): void {
    if (this.client) {
      this.client.onNotification(callback);
    }
  }

  // Convert between our game format and Linera format
  static boardToLinera(cells: Map<string, boolean>, size: number): LineraBoard {
    const liveCells: Array<{ x: number; y: number }> = [];

    cells.forEach((alive, key) => {
      if (alive) {
        const [x, y] = key.split(",").map(Number);
        liveCells.push({ x, y });
      }
    });

    return { size, liveCells };
  }

  static lineraToBoard(lineraBoard: LineraBoard): Map<string, boolean> {
    const cells = new Map<string, boolean>();

    lineraBoard.liveCells.forEach(({ x, y }) => {
      cells.set(`${x},${y}`, true);
    });

    return cells;
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }
}

// Block Pattern (2x2):
// X X
// X X
// Just 4 cells in a square formation.

// Boat Pattern:
// X X .
// X . X
// . X .
// A 5-cell boat-shaped stable pattern.
