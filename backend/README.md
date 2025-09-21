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
linera_spawn linera net up --policy-config testnet --with-faucet --faucet-port $FAUCET_PORT

# If you're using a testnet, run this instead:
#   LINERA_TMP_DIR=$(mktemp -d)
#   FAUCET_URL=https://faucet.testnet-XXX.linera.net  # for some value XXX
```

Create the user wallet and add a chain to it:

```bash
export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

linera wallet init --faucet $FAUCET_URL

INFO=($(linera wallet request-chain --faucet $FAUCET_URL))
CHAIN="${INFO[0]}"
OWNER="${INFO[1]}"
```

### Creating the scoring chains

Let's create another wallet and two scoring chains. The app wallet will be accessible with `linera -w1`.

```bash
export LINERA_WALLET_1="$LINERA_TMP_DIR/wallet_1.json"
export LINERA_KEYSTORE_1="$LINERA_TMP_DIR/keystore_1.json"
export LINERA_STORAGE_1="rocksdb:$LINERA_TMP_DIR/client_1.db"

linera -w1 wallet init --faucet $FAUCET_URL

INFO_1=($(linera -w1 wallet request-chain --faucet $FAUCET_URL))
CHAIN_1="${INFO_1[0]}"
OWNER_1="${INFO_1[1]}"

INFO_2=($(linera -w1 wallet request-chain --faucet $FAUCET_URL))
CHAIN_2="${INFO_1[0]}"
OWNER_2="${INFO_1[1]}"
```

### Creating the GoL challenge application

We use the default chain of the first wallet to create the application on it and start the
node service.

```bash
APP_ID=$(linera --wait-for-outgoing-messages \
  project publish-and-create backend gol_challenge $CHAIN)
```

### Creating a new puzzle

```bash
cargo run --bin gol -- create-puzzles -o $LINERA_TMP_DIR

BLOB_ID=$(linera publish-data-blob "$LINERA_TMP_DIR/02_beehive_pattern_puzzle.bcs")
```

### Publishing puzzles and running code-generation

Run the node service for the scoring chains.
```bash
linera -w1 service --port 8081 &
sleep 1
```

The following script creates puzzles with the `gol` tool, then it uses the user wallet to
publish them. At the same time, it also sends GraphQL queries to the scoring chain(s) to register
the puzzles.

```bash
./publish-puzzles.sh http://localhost:8081/chains/$CHAIN_1/applications/$APP_ID http://localhost:8081/chains/$CHAIN_2/applications/$APP_ID
```

Note that we never unregister puzzles.

### Testing the user's GraphQL APIs

In this section, we are using the GraphQL service of the native client to show examples of
GraphQL queries. Note that Web frontends have their own GraphQL endpoint.

```bash
linera service --port 8080 &
PID=$!
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
    submitSolution(puzzleId: "$BLOB_ID", scoringChainId: "$CHAIN_1", board: {
        size: 9,
        liveCells: [{x: 3, y: 2}, {x: 4, y: 2}, {x: 2, y: 3}, {x: 5, y: 3}, {x: 3, y: 4}, {x: 4, y: 4}]
    })
}
```

### Testing the scoring chain's GraphQL APIs

To debug GraphQL APIs, uncomment the line with `read` and run `bash -x -e <(linera extract-script-from-markdown backend/README.md)`.
```bash
echo http://localhost:8081/chains/$CHAIN_1/applications/$APP_ID
echo http://localhost:8081/chains/$CHAIN_2/applications/$APP_ID
# read
```

```gql,uri=http://localhost:8081/chains/$CHAIN_1/applications/$APP_ID
query {
    reportedSolutions {
        entry(key: "$OWNER") {
            key
            value {
                entries(input: {}) {
                    key
                    value
                }
            }
        }
    }
}
```

### Testing the scoring chain's GraphQL APIs from another wallet

We re-use the user wallet for simplicity.

Restart the service with the scoring chain followed in read-only:
```bash
kill $PID

linera wallet follow-chain "$CHAIN_1"
linera wallet follow-chain "$CHAIN_2"

linera service --port 8080 &
```

```gql,uri=http://localhost:8080/chains/$CHAIN_1/applications/$APP_ID
query {
    reportedSolutions {
        entry(key: "$OWNER") {
            key
            value {
                entries(input: {}) {
                    key
                    value
                }
            }
        }
    }
}
```

The error "kill: ???: No such process" at the end is expected.
