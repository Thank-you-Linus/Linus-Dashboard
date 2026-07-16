# Linus Dashboard - Minimal Development Commands

.PHONY: help dev build build-watch build-prod lint install fake-house

# Default help
help:
	@echo "🎯 Linus Dashboard Commands"
	@echo ""
	@echo "   dev         Start Home Assistant development server"
	@echo "   build       Build frontend (development)"
	@echo "   build-watch Build frontend in watch mode"
	@echo "   build-prod  Build frontend (production)"
	@echo "   lint        Run linting and formatting"
	@echo "   install     Install dependencies"
	@echo "   fake-house  Provision the fake house test entities (run once, needs HA_TOKEN in .env)"
	@echo ""

# Start Home Assistant
dev:
	@echo "📄 Loading environment..."
	@echo "🐍 Activating Python virtual environment..."
	@echo "🚀 Starting Home Assistant on http://localhost:8123"
	@. ./.env 2>/dev/null || true; \
	./ha-env/bin/hass --config ./config

# Build frontend
build:
	npm run build

build-watch:
	npm run build-dev

build-prod:
	npm run build-prod

# Linting
lint:
	./ha-env/bin/ruff check . || true
	./ha-env/bin/ruff format . || true
	npx eslint src/ --fix || true

# Install dependencies
install:
	./ha-env/bin/pip install -r requirements.txt
	npm install

# Provision the fake house test entities (areas, floors, random sensors).
# One-time setup: start `make dev`, create the admin account in the browser,
# then create a long-lived access token (Profile -> Security -> Tokens) and
# put it in .env as HA_TOKEN. Safe to re-run any time (idempotent).
fake-house:
	@set -a; . ./.env 2>/dev/null || true; set +a; \
	HA_URL=$${HA_URL:-http://localhost:8123} ./ha-env/bin/python config/setup_fake_house_full.py

