#!/usr/bin/env node
/**
 * E2E Test Server
 *
 * Simple Express-like server for serving the test harness and Linus Strategy bundle.
 * Injects HA fixture data into the test page.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const HOST = 'localhost';

// Paths
const BUNDLE_PATH = path.resolve(__dirname, '../../custom_components/linus_dashboard/www/linus-strategy.js');
const HARNESS_PATH = path.resolve(__dirname, 'harness/test-page.html');
const FIXTURE_DIR = path.resolve(__dirname, '../ha-fixture');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Load the HA fixture data.
 */
function loadFixture() {
  try {
    const loadJSON = (filename) => {
      const filepath = path.join(FIXTURE_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content);
    };

    return {
      version: loadJSON('fixture-version.json'),
      configuration: loadJSON('configuration.json', {}),
      entityRegistry: loadJSON('entity_registry.json', []).entities || [],
      deviceRegistry: loadJSON('device_registry.json', []).devices || [],
      areaRegistry: loadJSON('area_registry.json', []).areas || [],
      floorRegistry: loadJSON('floor_registry.json', []).floors || [],
      labelRegistry: loadJSON('label_registry.json', []).labels || [],
      states: loadJSON('states.json', {}).states || {},
      icons: loadJSON('icons.json', {}),
      linusConfig: loadJSON('linus_config.json', {}),
    };
  } catch (error) {
    console.error('Failed to load fixture:', error.message);
    process.exit(1);
  }
}

/**
 * Create the test page with injected fixture data.
 */
function createTestPage(fixture) {
  const template = fs.readFileSync(HARNESS_PATH, 'utf-8');

  // Inject fixture data as a script tag
  const fixtureScript = `<script>window.__HA_FIXTURE__ = ${JSON.stringify(fixture)};</script>`;

  // Insert before the closing </head> tag
  return template.replace('</head>', `${fixtureScript}</head>`);
}

/**
 * Check if the bundle exists.
 */
function checkBundle() {
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(`❌ Bundle not found: ${BUNDLE_PATH}`);
    console.error('Please run "npm run build" first.');
    process.exit(1);
  }
}

/**
 * Handle incoming requests.
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: Root - serve test harness
  if (pathname === '/' || pathname === '/index.html') {
    try {
      const fixture = loadFixture();
      const page = createTestPage(fixture);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(page);
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${error.message}`);
      return;
    }
  }

  // Route: Bundle
  if (pathname === '/linus-strategy.js') {
    try {
      const content = fs.readFileSync(BUNDLE_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Bundle Error: ${error.message}`);
      return;
    }
  }

  // Route: Fixture data (for debugging)
  if (pathname === '/api/fixture') {
    try {
      const fixture = loadFixture();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(fixture, null, 2));
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Fixture Error: ${error.message}`);
      return;
    }
  }

  // Route: Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bundle: fs.existsSync(BUNDLE_PATH),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Main
console.log('🔧 Checking prerequisites...');
checkBundle();

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`
✅ E2E Test Server running at http://${HOST}:${PORT}

Available endpoints:
  - http://${HOST}:${PORT}/         - Test harness
  - http://${HOST}:${PORT}/health   - Health check
  - http://${HOST}:${PORT}/api/fixture - Raw fixture data

Press Ctrl+C to stop.
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});
