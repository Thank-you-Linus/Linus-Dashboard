# Linus Dashboard E2E testing

This repository now includes a Playwright-based regression harness that runs against a versioned Home Assistant fixture.

## What it checks

- dashboard generation still succeeds
- the entity ↔ device ↔ area ↔ floor mapping stays valid
- generated views keep their expected shape
- the visible summary cards match the fixture counts
- failures capture screenshots, video, and trace artifacts automatically

## What you can inspect in the MR

- the GitHub Actions comment now links to the live Playwright HTML report on GitHub Pages
- on CI, Playwright records videos so you can visually inspect what the test exercised
- on failure, the screenshots, trace, and video are uploaded as debug artifacts in the workflow run
- the report URL is stable per PR/commit, so you can open it directly in the browser

## Coverage matrix

| User intent | Current test coverage | Proof in artifacts |
|---|---|---|
| Dashboard generates successfully | `should generate dashboard with views` | Video + HTML report |
| Areas/floors are still mapped | area/floor assertions in `strategy.spec.ts` | HTML report + trace |
| Summary matches the fixture | summary count assertions | Screenshot + HTML report |
| Runtime is reasonable | timing assertion | Trace + logs |

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
