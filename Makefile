# Linus Dashboard - Minimal Development Commands

.PHONY: help dev build build-watch build-prod lint clean install

# Default help
help:
	@echo "🎯 Linus Dashboard Commands"
	@echo ""
	@echo "   dev         Start Home Assistant development server"
	@echo "   build       Build frontend (development)"
	@echo "   build-watch Build frontend in watch mode"
	@echo "   build-prod  Build frontend (production)"
	@echo "   lint        Run linting and formatting"
	@echo "   clean       Clean build artifacts"
	@echo "   install     Install dependencies"
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

# Clean
clean:
	rm -rf node_modules/.cache/
	rm -rf src/dist/
	rm -rf custom_components/linus_dashboard/www/*.js*
	rm -rf custom_components/linus_dashboard/www/*.map
