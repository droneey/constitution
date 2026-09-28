// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/entrypoints/**',
    '!src/root/**',
    '!src/main.{ts,tsx}',
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
