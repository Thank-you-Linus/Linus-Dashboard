# Linus Dashboard E2E testing

This repository now includes a Playwright-based regression harness that runs against a versioned Home Assistant fixture.

## What it checks

- dashboard generation still succeeds
- the entity ↔ device ↔ area ↔ floor mapping stays valid
- generated views keep their expected shape
- failures capture screenshots, video, and trace artifacts automatically

## Fixture strategy

The fixture lives in `tests/ha-fixture/` and should be updated only when the Home Assistant test instance changes in a deliberate way.
It is meant to preserve the stable mapping needed by Linus Dashboard, especially entity ↔ area relationships.

## Local run

```bash
npm ci
npm run build
npm run test:e2e
```

## Failure artifacts

When a test fails, Playwright writes artifacts to `test-results/` and the HTML report to `playwright-report/`.
Those directories are uploaded by GitHub Actions in the `E2E Diagnostics` workflow.

## Updating the fixture

1. Export registry snapshots from Home Assistant.
2. Update `tests/ha-fixture/*`.
3. Keep the entity ↔ area mapping consistent with the dashboard layout.
4. Bump `tests/ha-fixture/fixture-version.json`.
