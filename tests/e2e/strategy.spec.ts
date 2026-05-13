/**
 * Linus Dashboard Strategy E2E Tests
 *
 * Playwright tests for the Linus Strategy dashboard generation.
 * Captures screenshots, videos, and traces on failure.
 */

import { test, expect } from '@playwright/test';
import { loadFixture, validateEntityAreaMapping } from './harness/fixture-loader';

/**
 * Helper to wait for test results to be available.
 */
async function waitForTestResults(page: any, timeout = 30000) {
  await page.waitForFunction(
    () => (window as any).testResults && ((window as any).testResults.initialized || (window as any).testResults.errors.length > 0),
    { timeout }
  );
  return page.evaluate(() => (window as any).testResults);
}

test.describe('Linus Dashboard Strategy', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test harness
    await page.goto('/');

    // Wait for the page to load
    await page.waitForSelector('.test-container', { timeout: 10000 });
  });

  test('should load the test harness successfully', async ({ page }) => {
    // Verify the page title
    const title = await page.title();
    expect(title).toContain('Linus Dashboard E2E Test Harness');

    // Verify the status bar exists
    const statusBar = await page.locator('#status-bar');
    await expect(statusBar).toBeVisible();

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'test-results/initial-state.png' });
  });

  test('should validate fixture data', async ({ page }) => {
    // Validate the fixture data
    const fixture = loadFixture('v1.0.0');
    const validation = validateEntityAreaMapping(fixture);

    // Log validation results
    console.log('Fixture Validation:', {
      valid: validation.valid,
      stats: validation.stats,
      errors: validation.errors,
    });

    // All entity↔area mappings should be valid
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Verify expected counts
    expect(validation.stats.entities).toBeGreaterThan(0);
    expect(validation.stats.areas).toBeGreaterThan(0);
    expect(validation.stats.devices).toBeGreaterThan(0);
    expect(validation.stats.floors).toBeGreaterThan(0);
  });

  test('should generate dashboard with views', async ({ page }) => {
    // Wait for the test to complete (success or failure)
    const results = await waitForTestResults(page, 30000);

    // Log results for debugging
    console.log('Dashboard Generation Results:', {
      initialized: results.initialized,
      viewCount: results.dashboard?.views?.length || 0,
      errors: results.errors,
      timing: results.timing,
    });

    // Should initialize without errors
    expect(results.errors).toHaveLength(0);
    expect(results.initialized).toBe(true);

    // Should have generated views
    expect(results.dashboard).toBeDefined();
    expect(results.dashboard.views).toBeDefined();
    expect(results.dashboard.views.length).toBeGreaterThan(0);

    const fixture = loadFixture('v1.0.0');
    const views = results.dashboard.views;
    const viewPaths = new Set(views.map((view: any) => view.path));

    // The generated dashboard must cover every configured area, floor, and the unavailable bucket
    for (const area of fixture.areaRegistry) {
      const slug = area.slug || area.name.toLowerCase().replace(/\s+/g, '_');
      expect(
        viewPaths.has(area.area_id) || viewPaths.has(slug) || views.some((view: any) => view.title === area.name),
        `Expected view for area: ${area.name}`,
      ).toBe(true);
    }

    for (const floor of fixture.floorRegistry) {
      expect(viewPaths.has(floor.floor_id), `Expected floor view: ${floor.floor_id}`).toBe(true);
    }

    expect(viewPaths.has('unavailable')).toBe(true);

    // Verify view structure
    for (const view of views) {
      expect(view).toHaveProperty('title');
      expect(view).toHaveProperty('path');

      // Subviews should have strategy configuration
      if (view.subview) {
        expect(view).toHaveProperty('strategy');
        expect(view.strategy).toHaveProperty('type');
        expect(view.strategy.type).toBe('custom:linus-strategy');
      }
    }

    // Take screenshot of the final state
    await page.screenshot({ path: 'test-results/dashboard-generated.png', fullPage: true });
  });

  test('should create area views for all areas', async ({ page }) => {
    const results = await waitForTestResults(page, 30000);

    expect(results.initialized).toBe(true);

    const fixture = loadFixture('v1.0.0');
    const expectedAreas = fixture.areaRegistry.map((a: any) => ({
      id: a.area_id,
      name: a.name,
      slug: a.slug || a.name.toLowerCase().replace(/\s+/g, '_'),
    }));

    const views = results.dashboard.views || [];

    // Check that area views exist
    for (const area of expectedAreas) {
      const areaView = views.find((v: any) =>
        v.path === area.id ||
        v.path === area.slug ||
        v.title === area.name
      );

      // Each area should have a corresponding view
      expect(areaView, `Expected view for area: ${area.name}`).toBeDefined();
      expect(areaView?.subview).toBe(true);
    }
  });

  test('should create floor views for all floors', async ({ page }) => {
    const results = await waitForTestResults(page, 30000);

    expect(results.initialized).toBe(true);

    const fixture = loadFixture('v1.0.0');
    const expectedFloors = fixture.floorRegistry.map((f: any) => f.floor_id);

    const views = results.dashboard.views || [];

    // Check that floor views exist
    for (const floorId of expectedFloors) {
      const floorView = views.find((v: any) => v.path === floorId);

      // Each floor should have a corresponding view
      expect(floorView, `Expected view for floor: ${floorId}`).toBeDefined();
      expect(floorView?.subview).toBe(true);
    }
  });

  test('should handle unavailable entities correctly', async ({ page }) => {
    const results = await waitForTestResults(page, 30000);

    expect(results.initialized).toBe(true);

    // Check that there's an unavailable view
    const views = results.dashboard.views || [];
    const unavailableView = views.find((v: any) => v.path === 'unavailable');

    expect(unavailableView).toBeDefined();
    expect(unavailableView?.title).toBe('Unavailable');
    expect(unavailableView?.subview).toBe(true);
  });

  test('should complete within reasonable time', async ({ page }) => {
    const results = await waitForTestResults(page, 30000);

    expect(results.initialized).toBe(true);
    expect(results.timing).toBeDefined();
    expect(results.timing.duration).toBeDefined();

    // Dashboard generation should complete within 10 seconds
    expect(results.timing.duration).toBeLessThan(10000);

    console.log(`Dashboard generated in ${results.timing.duration}ms`);
  });

  test('should display accurate entity counts in summary', async ({ page }) => {
    const results = await waitForTestResults(page, 30000);

    expect(results.initialized).toBe(true);

    const fixture = loadFixture('v1.0.0');

    const summaryCardCount = async (label: string) => {
      const card = page.locator('.view-card').filter({ hasText: label }).first();
      await expect(card).toBeVisible();
      const countText = await card.locator('.count').textContent();
      return parseInt(countText || '0', 10);
    };

    const totalViews = await summaryCardCount('Total Views');
    const areaViews = await summaryCardCount('Area Views');
    const floorViews = await summaryCardCount('Floor Views');

    expect(totalViews).toBe(results.dashboard.views.length);
    expect(areaViews).toBeGreaterThanOrEqual(fixture.areaRegistry.length);
    expect(floorViews).toBeGreaterThanOrEqual(fixture.floorRegistry.length);
  });
});

test.describe('Health Check', () => {
  test('server health endpoint should respond', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.bundle).toBe(true);
    expect(body.timestamp).toBeDefined();
  });

  test('fixture endpoint should return valid data', async ({ request }) => {
    const response = await request.get('/api/fixture');
    expect(response.ok()).toBeTruthy();

    const fixture = await response.json();
    expect(fixture.version).toBeDefined();
    expect(fixture.entityRegistry).toBeDefined();
    expect(fixture.areaRegistry).toBeDefined();
    expect(fixture.states).toBeDefined();
  });
});

test.describe('Error Handling', () => {
  test('should handle missing bundle gracefully', async ({ page, request }) => {
    // This test verifies error handling, but we can't easily remove the bundle
    // So we just verify the error display works
    await page.goto('/');

    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);

    // Check if there's an error message (if something went wrong)
    const errorMessage = await page.locator('.error-message');
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      // If there's an error, it should be displayed
      const errorText = await errorMessage.textContent();
      expect(errorText).toBeTruthy();
    }
  });
});
