# Linus Dashboard - Minimal Development Commands

.PHONY: help dev build build-watch build-prod lint install bootstrap fake-house

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
	@echo "   bootstrap   Create the HA admin account + HA_TOKEN, no browser needed"
	@echo "   fake-house  Provision the fake house test entities (bootstraps first if needed)"
	@echo ""

# Start Home Assistant
dev:
	@echo "📄 Loading environment..."
	@if [ ! -e config/custom_components ]; then \
		echo "🔗 Linking custom_components into config..."; \
		ln -s ../custom_components config/custom_components; \
	else \
		echo "🔗 config/custom_components already exists, skipping symlink"; \
	fi
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

# Create the HA admin account and a long-lived HA_TOKEN in .env, entirely via
# the API (same one HA's own onboarding wizard uses) — no browser needed.
# Safe to re-run: no-ops immediately if .env already has a working HA_TOKEN.
bootstrap:
	@set -a; . ./.env 2>/dev/null || true; set +a; \
	HA_URL=$${HA_URL:-http://localhost:8123} ./ha-env/bin/python config/bootstrap_ha_onboarding.py

# Provision the fake house test entities (areas, floors, random sensors).
# Bootstraps first if .env has no working HA_TOKEN yet, so this is the one
# command that takes a fresh `make dev` all the way to a populated fake
# house — no browser, no manual token creation. Safe to re-run (idempotent).
fake-house: bootstrap
	@set -a; . ./.env 2>/dev/null || true; set +a; \
	HA_URL=$${HA_URL:-http://localhost:8123} ./ha-env/bin/python config/setup_fake_house_full.py

