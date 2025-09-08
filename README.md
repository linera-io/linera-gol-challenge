# Game-of-Life challenge

```
cargo install linera-storage-service@0.15.1 linera-service@0.15.1

cargo build --release --target wasm32-unknown-unknown

cargo run --bin gol -- create-puzzles

linera extract-script-from-markdown backend/README.md | bash -ex
```
