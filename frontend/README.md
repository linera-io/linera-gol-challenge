## Prerequisites

> **Important Note:** This project includes temporary fixes and shows the direction of ongoing development. Some manual configuration is required.

### Repository Structure

The project requires a specific directory structure with the Linera protocol repository:

```
root/
  gol-challenge/          (this repository)
  linera-protocol/     (Linera SDK repository)
```

### Linera Protocol Setup

1. Clone the `linera-protocol` repository next to this project
2. Checkout the `devnet_2025_08_21` branch (required until a new module is published to npmjs)

```bash
cd ..
git clone https://github.com/linera-io/linera-protocol.git
cd linera-protocol
git checkout devnet_2025_08_21
```

## Installation

### Step 1: Install Linera SDK Dependencies

Navigate to the Linera protocol packages and install dependencies:

```bash
# Install @linera/client dependencies
cd ../../linera-protocol/linera-web
pnpm install

# Install @linera/signer dependencies
cd ../../linera-protocol/linera-web/signer
pnpm install
```

### Step 2: Install Project Dependencies

Return to this project and install its dependencies:

```bash
cd ../../../../gol-challenge
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
