// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/main.{ts,tsx}',
    '!src/**/*.gen.*',
    '!src/**/*.d.ts',
  ],
};
