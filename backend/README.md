# Game-of-Life (GoL) Challenge

This application allows users to play with Conway's Game of Life (GoL) and solve specific
puzzles to earn points.

## Usage

### Setting up

Make sure you have the `linera` binary in your `PATH`, and that it is compatible with your
`linera-sdk` version.

For scripting purposes, we also assume that the BASH function `linera_spawn` is defined.
From the root of Linera repository, this can be achieved as follows:

```bash
source /dev/stdin <<<"$(linera net helper 2>/dev/null)"
```

Start the local Linera network and run a faucet:

```bash
FAUCET_PORT=8079
FAUCET_URL=http://localhost:$FAUCET_PORT
linera_spawn linera net up --with-faucet --faucet-port $FAUCET_PORT

# If you're using a testnet, run this instead:
#   LINERA_TMP_DIR=$(mktemp -d)
#   FAUCET_URL=https://faucet.testnet-XXX.linera.net  # for some value XXX
```

Create the user wallets and add chains to them:

```bash
export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

linera wallet init --faucet $FAUCET_URL

INFO=($(linera wallet request-chain --faucet $FAUCET_URL))
CHAIN="${INFO[0]}"
OWNER="${INFO[1]}"
```

### Creating the GoL challenge application

We use the default chain of the first wallet to create the application on it and start the
node service.

```bash
APP_ID=$(linera --wait-for-outgoing-messages \
  project publish-and-create backend gol_challenge $CHAIN \
    --json-argument "null")
```

### Creating a new puzzle

```bash
cargo run --bin gol -- create-puzzles -o $LINERA_TMP_DIR

BLOB_ID=$(linera publish-data-blob "$LINERA_TMP_DIR/02_beehive_pattern_puzzle.bcs")
```

### Publishing puzzles and running code-generation

```bash
./publish-puzzles.sh
```

### Testing the GraphQL APIs

In this section, we are using the GraphQL service of the native client to show examples of
GraphQL queries. Note that Web frontends have their own GraphQL endpoint.

```bash
linera service --port 8080 &
sleep 1
```

```gql,uri=http://localhost:8080/chains/$CHAIN/applications/$APP_ID
query {
    printPuzzle(puzzleId: "$BLOB_ID")
}
```

```gql,uri=http://localhost:8080/chains/$CHAIN/applications/$APP_ID
query {
    puzzle(puzzleId: "$BLOB_ID") { title, summary }
}
```

```gql,uri=http://localhost:8080/chains/$CHAIN/applications/$APP_ID
mutation {
    submitSolution(puzzleId: "$BLOB_ID", board: {
        size: 9,
        liveCells: [{x: 3, y: 2}, {x: 4, y: 2}, {x: 2, y: 3}, {x: 5, y: 3}, {x: 3, y: 4}, {x: 4, y: 4}]
    })
}
```
