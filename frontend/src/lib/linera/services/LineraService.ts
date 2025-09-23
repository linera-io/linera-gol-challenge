import type { Wallet as DynamicWallet } from "@dynamic-labs/sdk-react-core";
import { lineraAdapter } from "../lib/linera-adapter";
import { LINERA_RPC_URL, GOL_APP_ID, PREVIOUS_GOL_APP_IDS, GOL_SCORING_CHAIN_IDS } from "../constants";
import { Puzzle, LineraBoard, ValidationResult, DifficultyLevel } from "@/lib/types/puzzle.types";

export interface WalletInfo {
  chainId: string;
  createdAt: string;
  scoringChainId: string;
}

export class LineraService {
  private static instance: LineraService | null = null;
  private initialized = false;
  private isInitializing = false;
  private walletInfo: WalletInfo | null = null;
  private notificationUnsubscribe: (() => void) | null = null;

  private constructor() {}

  static getInstance(): LineraService {
    if (!this.instance) {
      this.instance = new LineraService();
    }
    return this.instance;
  }

  async initialize(dynamicWallet: DynamicWallet): Promise<void> {
    if (this.initialized) return;
    if (this.isInitializing) return;

    this.isInitializing = true;

    try {
      console.log("Initializing Linera service with Dynamic wallet...");

      const provider = await lineraAdapter.connect(dynamicWallet, LINERA_RPC_URL);

      await lineraAdapter.setApplications(GOL_APP_ID, PREVIOUS_GOL_APP_IDS);

      const address = lineraAdapter.getAddress();
      const value = Number(address.substring(0, 10)); // top 8 hex digits including 0x
      const index = value % GOL_SCORING_CHAIN_IDS.length;
      const scoringChainId = GOL_SCORING_CHAIN_IDS[index];

      this.walletInfo = {
        chainId: provider.chainId,
        createdAt: new Date().toISOString(),
        scoringChainId: scoringChainId,
      };

      this.initialized = true;
      console.log("✅ Linera service initialized successfully: ", this.walletInfo);
    } catch (error) {
      console.error("Failed to initialize Linera service:", error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async checkWallet(): Promise<WalletInfo | null> {
    return this.walletInfo;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !lineraAdapter.isApplicationSet() || !this.walletInfo) {
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

    const result = await lineraAdapter.queryApplication<any>(query);

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data.printBoard;
  }

  async advanceBoard(board: LineraBoard, steps: number = 1): Promise<LineraBoard> {
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

    const result = await lineraAdapter.queryApplication<any>(query);

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data.advanceBoard;
  }

  async validateSolution(board: LineraBoard, puzzleId: string): Promise<ValidationResult> {
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

    const result = await lineraAdapter.queryApplication<any>(query);

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
    const scoringChainId = this.getWalletInfo().scoringChainId;
    try {
      const mutation = {
        query: `
          mutation SubmitSolution($puzzleId: String!, $board: BoardInput!, $scoringChainId: String!) {
            submitSolution(puzzleId: $puzzleId, board: $board, scoringChainId: $scoringChainId)
          }
        `,
        variables: { puzzleId, board, scoringChainId },
      };

      const result = await lineraAdapter.queryApplication<any>(mutation);

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
              initialConditions
              finalConditions
            }
          }
        `,
        variables: { puzzleId },
      };

      const result = await lineraAdapter.queryApplication<any>(query);
      console.log("[GOL] Query sent using address: ", lineraAdapter.getAddress());
      console.log("[GOL] Got response from getPuzzle", result);

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      if (!result.data?.puzzle) {
        console.warn(`No puzzle data found for ID: ${puzzleId}`);
        return null;
      }

      const puzzleData = result.data.puzzle;
      console.log("[GOL] Parsed puzzle data:", puzzleData);

      // Ensure difficulty is valid, default to "EASY" if not
      const validDifficulties = ["TUTORIAL", "EASY", "MEDIUM", "HARD", "EXPERT"];
      const difficulty = validDifficulties.includes(puzzleData.difficulty)
        ? (puzzleData.difficulty as DifficultyLevel)
        : "EASY";

      if (puzzleData.difficulty !== difficulty) {
        console.warn(`Invalid difficulty value: ${puzzleData.difficulty}, defaulting to EASY`);
      }

      return {
        id: puzzleId,
        title: puzzleData.title || "Untitled Puzzle",
        summary: puzzleData.summary || "No description available",
        difficulty: difficulty as DifficultyLevel,
        size: puzzleData.size || 7,
        minimalSteps: puzzleData.minimalSteps || 0,
        maximalSteps: puzzleData.maximalSteps || 100,
        initialConditions: puzzleData.initialConditions || [],
        finalConditions: puzzleData.finalConditions || [],
      };
    } catch (error) {
      console.error("Failed to get puzzle:", error);
      return null;
    }
  }

  async isPuzzleCompleted(puzzleId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const query = {
        query: `
          query CheckSolution($puzzleId: String!) {
            solutions {
              entry(key: $puzzleId) {
                board {
                  size
                }
                timestamp
              }
            }
          }
        `,
        variables: { puzzleId },
      };

      const results = await lineraAdapter.queryCurrentAndPreviousApplications<any>(query);
      console.log("[GOL] Check puzzle completion response", results);

      for (const result of results) {
        if (result.errors) {
          // If there's an error, skip the reponse.
          continue
        }

        // If we have a solution entry, the puzzle is completed
        if (result.data?.solutions?.entry !== null) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Failed to check puzzle completion:", error);
      return false;
    }
  }

  async getCompletedPuzzleIds(): Promise<Set<string>> {
    await this.ensureInitialized();

    try {
      const query = {
        query: `
          query GetCompletedPuzzles {
            solutions {
              keys
            }
          }
        `,
        variables: {},
      };

      const results = await lineraAdapter.queryCurrentAndPreviousApplications<any>(query);
      console.log("[GOL] Query sent using address: ", lineraAdapter.getAddress());

      const keys = new Set<string>();
      for (const result of results) {
        if (result.errors) {
          continue
        }

        // If we have a solution entry, the puzzle is completed
        if (result.data?.solutions?.keys) {
          result.data?.solutions?.keys.forEach((item) => keys.add(item));
        }
      }

      // The keys field returns an array of DataBlobHash (puzzle IDs)
      return keys;
    } catch (error) {
      console.error("Failed to get completed puzzle IDs:", error);
      return new Set<string>();
    }
  }

  onNotification(callback: (notification: any) => void): void {
    this.notificationUnsubscribe = lineraAdapter.onNewBlockNotification(callback);
  }

  async disconnect(): Promise<void> {
    // Unsubscribe from notifications
    if (this.notificationUnsubscribe) {
      this.notificationUnsubscribe();
      this.notificationUnsubscribe = null;
    }
    
    lineraAdapter.reset();
    this.initialized = false;
    this.isInitializing = false;
    this.walletInfo = null;
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

  getWalletInfo(): WalletInfo {
    if (!this.walletInfo) {
      throw new Error("Linera service not initialized");
    }
    return this.walletInfo;
  }
}
