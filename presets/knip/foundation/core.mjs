// biome-ignore lint/style/noDefaultExport: knip reads a configuration's default export
export default {
  entry: [
    'src/main.{ts,tsx}!',
  ],
  project: [
    'src/**/*.{ts,tsx}!',
    '!src/**/__tests__/**!',
    'tests/**/*.{ts,tsx}',
  ],
};
