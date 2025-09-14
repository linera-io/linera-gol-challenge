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
        chain3["GoL scoring chain"]
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

```
cargo install linera-storage-service@0.15.3 linera-service@0.15.3

cargo build --release --target wasm32-unknown-unknown

cargo run --bin gol -- create-puzzles

linera extract-script-from-markdown backend/README.md | bash -ex
```
