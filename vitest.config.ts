import { defineConfig } from 'vitest/config';

export default defineConfig({
  // rspack injects __VERSION__ at build time (rspack.config.cjs); mirror it for
  // tests so importing src/linus-strategy.ts (even transitively) does not throw.
  define: {
    __VERSION__: '"test"',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**'],
    },
  },
});
