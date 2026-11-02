import { describe, it, expect, vi } from 'vitest';

/**
 * SettingsPopup imports `version` from src/linus-strategy.ts, which evaluates
 * `__VERSION__` at module load. rspack injects it at build time; vitest.config.ts
 * mirrors it via `define`. Without that, importing SettingsPopup (even
 * transitively) throws `ReferenceError: __VERSION__ is not defined`.
 *
 * Single import per file on purpose: linus-strategy.ts calls
 * `customElements.define`, which throws if the module is re-evaluated.
 */

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false },
    areas: {},
    floors: {},
    devices: {},
    entities: {},
    localize: vi.fn((key: string) => key),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

describe('SettingsPopup import', () => {
  it('imports without ReferenceError and exposes the test version', async () => {
    const popupModule = await import('../../src/popups/SettingsPopup');
    expect(popupModule).toBeDefined();

    const strategyModule = await import('../../src/linus-strategy');
    expect(strategyModule.version).toBe('test');
  });
});
