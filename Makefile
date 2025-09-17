# Makefile for Game of Life Challenge
.PHONY: help install build deploy-frontend dev clean invalidate-cache

# Set the default target to help
.DEFAULT_GOAL := help

# Variables
ENV ?= development
BUCKET := gs://apps.linera.net/gol/
URL_MAP := linera-apps-url-map
FRONTEND_DIR := frontend
CACHE_PATH ?= /*

# Determine base path based on ENV variable
ifeq ($(filter $(ENV),production prod),$(ENV))
  BASE_PATH := /gol/
else
  BASE_PATH := /
endif

help: # Show this help message
	@echo "Game of Life Challenge - Build & Deploy"
	@echo ""
	@echo "Usage: make [target] [ENV=development|production|prod]"
	@echo ""
	@echo "Current settings:"
	@echo "  ENV=$(ENV)"
	@echo "  BASE_PATH=$(BASE_PATH)"
	@echo "  BUCKET=$(BUCKET)"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?# .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?# "}; {printf "  %-20s %s\n", $$1, $$2}'

install: # Install frontend dependencies
	cd $(FRONTEND_DIR) && pnpm install

build: # Build frontend with current ENV setting
	@echo "Building frontend with ENV=$(ENV), BASE_PATH=$(BASE_PATH)..."
	cd $(FRONTEND_DIR) && VITE_BASE_PATH=$(BASE_PATH) pnpm build -v

dev: # Run frontend development server
	cd $(FRONTEND_DIR) && pnpm dev

invalidate-cache: # Invalidate CDN cache
	@echo "Invalidating CDN cache for path: $(CACHE_PATH)..."
	@gcloud compute url-maps invalidate-cdn-cache $(URL_MAP) \
	  --path "$(CACHE_PATH)" \
	  --global --async
	@echo "Cache invalidation initiated for $(CACHE_PATH)"

deploy-frontend: # Build and deploy frontend to GCS
	@echo "Building and deploying frontend to $(BUCKET) with ENV=$(ENV), BASE_PATH=$(BASE_PATH)..."
	@( cd $(FRONTEND_DIR) && \
	  pnpm install && \
	  VITE_BASE_PATH=$(BASE_PATH) pnpm build -v && \
	  gcloud storage rsync -r --delete-unmatched-destination-objects \
	    ./dist/ '$(BUCKET)' && \
	  echo "Deployment complete!" \
	)
	@$(MAKE) invalidate-cache

deploy-quick: # Deploy without installing dependencies (assumes already built)
	@echo "Deploying frontend to $(BUCKET)..."
	@( cd $(FRONTEND_DIR) && \
	  gcloud storage rsync -r --delete-unmatched-destination-objects \
	    ./dist/ '$(BUCKET)' && \
	  echo "Deployment complete!" \
	)
	@$(MAKE) invalidate-cache

clean: # Clean build artifacts
	rm -rf $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/node_modules

# Backend targets (placeholder for future)
build-backend: # Build backend
	cargo build --release

test: # Run tests
	cargo test
	cd $(FRONTEND_DIR) && pnpm test

lint: # Run linters
	cargo clippy
	cd $(FRONTEND_DIR) && pnpm lint

format: # Format code
	cargo fmt
	cd $(FRONTEND_DIR) && pnpm format

format-check: # Check code formatting
	cargo fmt -- --check
	cd $(FRONTEND_DIR) && pnpm format:check
