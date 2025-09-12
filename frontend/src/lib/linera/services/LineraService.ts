import type { Wallet as DynamicWallet } from "@dynamic-labs/sdk-react-core";
import { lineraAdapter } from "../lib/linera-adapter";
import { GOL_APP_ID } from "../constants";

export interface LineraBoard {
  size: number;
  liveCells: Array<{ x: number; y: number }>;
}

// Condition types matching the backend structure
export interface Position {
  x: number;
  y: number;
}

export interface TestPositionCondition {
  TestPosition: {
    position: Position;
    is_live: boolean;
  };
}

export interface TestRectangleCondition {
  TestRectangle: {
    x_range: { start: number; end: number };
    y_range: { start: number; end: number };
    min_live_count: number;
    max_live_count: number;
  };
}

export type Condition = TestPositionCondition | TestRectangleCondition;

export interface Puzzle {
  id: string;
  title: string;
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard";
  size: number;
  minimalSteps: number;
  maximalSteps: number;
  initialConditions?: Condition[];
  finalConditions?: Condition[];
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
  private dynamicWallet: DynamicWallet | null = null;
  private initialized = false;
  private isInitializing = false;
  private walletInfo: WalletInfo | null = null;

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
      
      this.dynamicWallet = dynamicWallet;

      const provider = await lineraAdapter.connect(dynamicWallet);
      
      await lineraAdapter.setApplication(GOL_APP_ID);

      this.walletInfo = {
        chainId: provider.chainId,
        createdAt: new Date().toISOString(),
      };

      this.initialized = true;
      console.log("Linera service initialized successfully");
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
    if (!this.initialized || !lineraAdapter.isApplicationSet()) {
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

    const result = await lineraAdapter.queryApplication<any>(query);

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

    try {
      const mutation = {
        query: `
          mutation SubmitSolution($puzzleId: String!, $board: BoardInput!) {
            submitSolution(puzzleId: $puzzleId, board: $board)
          }
        `,
        variables: { puzzleId, board },
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

      const result = await lineraAdapter.queryApplication<any>(query);
      console.log("[GOL] Check puzzle completion response", result);

      if (result.errors) {
        // If there's an error, the solution doesn't exist
        return false;
      }

      // If we have a solution entry, the puzzle is completed
      return result.data?.solutions?.entry !== null;
    } catch (error) {
      console.error("Failed to check puzzle completion:", error);
      return false;
    }
  }

  async getCompletedPuzzleIds(): Promise<string[]> {
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

      const result = await lineraAdapter.queryApplication<any>(query);
      console.log("[GOL] Got completed puzzle IDs", result);

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        return [];
      }

      // The keys field returns an array of DataBlobHash (puzzle IDs)
      return result.data?.solutions?.keys || [];
    } catch (error) {
      console.error("Failed to get completed puzzle IDs:", error);
      return [];
    }
  }

  onNotification(_callback: (notification: any) => void): void {
    // Notifications not supported with Dynamic wallet yet
    console.warn("Notifications not yet supported with Dynamic wallet");
  }

  async disconnect(): Promise<void> {
    lineraAdapter.reset();
    this.initialized = false;
    this.isInitializing = false;
    this.dynamicWallet = null;
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
