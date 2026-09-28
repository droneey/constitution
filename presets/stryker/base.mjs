// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/main.{ts,tsx}',
    '!src/entrypoints/*/main.{ts,tsx}',
    '!src/root/wiring.{ts,tsx}',
    '!src/**/*.gen.*',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
  ],
  ignorePatterns: [
    '/.constitution',
  ],
  thresholds: {
    high: 100,
    low: 100,
    break: 100,
  },
};
