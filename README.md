# Game-of-Life challenge

## Architecture overview

See also https://www.notion.so/Game-of-Life-Challenge-24ebf4cdba9c80c98a1ccb9fabf0db04

```mermaid
flowchart LR
    user1("web user")
    user2("admin user") --> admin("admin CLI wallet")
    service("GoL service (private GraphQL API)")
    external("external service")
    user2 -- Registers puzzles --> service
    style user1 fill:#f9f,stroke:#333,stroke-width:1px,color:#000
    style user2 fill:#f9f,stroke:#333,stroke-width:1px,color:#000
    style external fill:#aff,stroke:#333,stroke-width:1px,color:#000

    subgraph "Linera network"
        chain1["user chain"]
        chain2["user chain"]
        chain3["GoL scoring chain x 4"]
        style chain1 fill:#bbf,stroke:#333,stroke-width:1px,color:#000
        style chain2 fill:#bbf,stroke:#333,stroke-width:1px,color:#000
    end

    user1 -- submits solution --> chain1
    chain2 -- creates chain --> chain3
 	chain1 -- notifies solution --> chain3

	admin -- publishes puzzle as blob --> chain2
	admin -- creates GoL scoring chain --> chain2
 	admin -- creates GoL application --> chain2
 	service -- processes inbox --> chain3
 	service -- registers puzzle --> chain3
 	external -- replicates scores --> chain3
 	portal("portal backend") -- queries --> external
```

## Quickstart (backend)

```ignore
cargo install linera-storage-service@0.15.3 linera-service@0.15.3

cargo build --release --target wasm32-unknown-unknown

cargo run --bin gol -- create-puzzles

bash -e -x <(linera extract-script-from-markdown backend/README.md)
```

## Testing scores against the production app

Run the commands below using `bash -e -x <(linera extract-script-from-markdown README.md)`.

```bash
# Production app
APP_ID=750eb4b947761eeece6c52fd488ec23442dce240fab150b93ea2212b014aaace

# Scoring chains
CHAIN_0=b4b3575bf33fc466b925b250812bb53147e4013d2be1d629efb7acb172d3c97b
CHAIN_1=ad6dbf944468255c573b4ad36daddbfe03c2de255c471cf8a0bca74e6c044ffd
CHAIN_2=35e0742d9f2171abd0758a334d3f3dbbe2c97567f5d455f0c4fca64a7c6ea3d3
CHAIN_3=0325662e35fb81d180b532af3083c303878ac60d63d850229c5eddc535dfbb9d

# Test user and its pinned scoring chain
MATHIEU_CLI="0x359C1a2203aE35adBFA85bC9C1EAB540bF8797a7"
# 2 == 0x359C1a220 % 4
CHAIN=$CHAIN_2

# Getting a chain and tracking the scores
FAUCET_URL=https://faucet.testnet-conway.linera.net

LINERA_TMP_DIR=$(mktemp -d)
export LINERA_WALLET="$LINERA_TMP_DIR/wallet.json"
export LINERA_KEYSTORE="$LINERA_TMP_DIR/keystore.json"
export LINERA_STORAGE="rocksdb:$LINERA_TMP_DIR/client.db"

linera wallet init --faucet $FAUCET_URL
linera wallet follow-chain $CHAIN

linera service --port 8080 &
```

```gql,uri=http://localhost:8080/chains/$CHAIN/applications/$APP_ID
query {
    reportedSolutions {
        entry(key: "$MATHIEU_CLI") {
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

## Previous scoring chains

The following chains were used previously and may contain valid scoring information from early users.

```
# APP_ID=750eb4b947761eeece6c52fd488ec23442dce240fab150b93ea2212b014aaace
CHAIN_V2_0=74b5850ecf6a7389523f7a9748dc6f81fc71533757f617b65e5c9f01fa1430b8
CHAIN_V2_1=3e6bdd095d2e4e30f12e8da38ea1409f2442696b01badbda4226577df09479ff
CHAIN_V2_2=78bfe088e0e6ab2acbb894c7bac4b537650a98ca7337667cef38359b6c590508
CHAIN_V2_3=d6e2e25987b75a51f9ac1df8851bd0e0d16d858e7e2896b1e9d511bac8e13f92

# /!\ APP_ID=27145fa604adf9996647a9a2add1dafe8f80f1a547835edf62ee408cd8903dd3
CHAIN_V1=e71636fde3a70cdbfdb7fd9bef6cb1ba632af8b0567b8f76df47b35489972dd3

```
