#!/bin/bash

# Script to publish all puzzles and generate metadata
# Usage: ./publish-puzzles.sh

set -e

# Expecting some URI to query the node service of the scoring chain.
# If absent, puzzles will be published but not registered for scoring.
URI="$1"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Cleanup function
cleanup() {
    echo "Cleaning up temporary directory..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "Step 1: Creating puzzle files..."
cargo run --bin gol -- create-puzzles -o "$TEMP_DIR"

echo "Step 2: Publishing puzzles to blockchain..."
echo "Note: Make sure your Linera wallet is configured and you have sufficient tokens"
echo ""

# Create a blob mapping file
cd "$TEMP_DIR"
# Discover puzzle files dynamically
PUZZLE_FILES=($(ls *_puzzle.bcs 2>/dev/null | sort))
cd -

BLOB_MAP_FILE="$TEMP_DIR/blob-mapping.json"
echo "{" > "$BLOB_MAP_FILE"

if [ ${#PUZZLE_FILES[@]} -eq 0 ]; then
    echo "Error: No puzzle files found in $TEMP_DIR"
    exit 1
fi

echo "Found ${#PUZZLE_FILES[@]} puzzle files: ${PUZZLE_FILES[*]}"
echo

for i in "${!PUZZLE_FILES[@]}"; do
    PUZZLE="${PUZZLE_FILES[$i]%%_puzzle.bcs}"
    PUZZLE_FILE="$TEMP_DIR/${PUZZLE}_puzzle.bcs"

    echo "Publishing ${PUZZLE}_puzzle.bcs..."

    # Publish the puzzle and capture the blob ID
    BLOB_ID=$(linera publish-data-blob "$PUZZLE_FILE")

    if [ -n "$BLOB_ID" ]; then
        echo "  Blob ID: $BLOB_ID"

        # Add to blob mapping (with comma except for last item)
        if [ $i -eq $((${#PUZZLE_FILES[@]}-1)) ]; then
            echo "  \"$PUZZLE\": \"$BLOB_ID\"" >> "$BLOB_MAP_FILE"
        else
            echo "  \"$PUZZLE\": \"$BLOB_ID\"," >> "$BLOB_MAP_FILE"
        fi

        if [ -n "$URI" ]; then
            QUERY="mutation { registerPuzzle(puzzleId: \"$BLOB_ID\")}"
            JSON_QUERY=$( jq -n --arg q "$QUERY" '{"query": $q}' )
            # Use js to parse the result and fail otherwise.
            curl -w '\n' -g -X POST -H "Content-Type: application/json" -d "$JSON_QUERY" "$URI" | tee /dev/stderr | jq -e .data
        fi
    else
        echo "  Error: Could not extract blob ID for $PUZZLE"
        exit 1
    fi
done

echo "}" >> "$BLOB_MAP_FILE"

echo ""
echo "Step 3: Generating TypeScript metadata..."
OUTPUT_FILE="frontend/src/lib/game-of-life/data/puzzles.ts"
cargo run --bin gol -- generate-metadata -o "$OUTPUT_FILE" --blob-map "$BLOB_MAP_FILE"

echo ""
echo "✅ All puzzles published and metadata generated!"
