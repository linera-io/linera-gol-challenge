## Prerequisites

> **Important Note:** This project includes temporary fixes and shows the direction of ongoing development. Some manual configuration is required.

## Installation

Return to this project and install its dependencies:

```bash
pnpm install
```

## Running the Application

### Step 1: Start the Backend

Follow the instructions in `backend/README.md` to start the Linera backend service.

```bash
cd backend
# Follow the README.md instructions there
```

### Step 2: Configure the Application

Update the following configuration in `src/lib/linera/services/LineraService.ts`:

1. **Faucet URL**: Update `FAUCET_URL` to match your backend configuration

   ```typescript
   private static readonly FAUCET_URL = "http://localhost:8079/";
   ```

2. **Application ID**: Update `GOL_APP_ID` with your deployed Game of Life application ID
   ```typescript
   private static readonly GOL_APP_ID = "your_app_id_here";
   ```

### Step 3: Add Puzzle IDs

Manually add the puzzle blob IDs in `src/lib/game-of-life/data/puzzles.ts`:

```typescript
export const KNOWN_PUZZLES: PuzzleMetadata[] = [
  {
    id: "c6f2b2e1a4bb32a6f2d1cbf29fd43f35fc51a20ca6eb4cafbc3bb20499f8a4ba",
    title: "Beehive Formation",
    summary: "Create a stable beehive pattern (6-cell hexagonal shape)",
    difficulty: "Easy",
  },
];
```

### Step 4: Start the Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`
