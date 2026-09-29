// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    '!src/entrypoints/*/main.{ts,tsx}',
    '!src/root/wiring.{ts,tsx}',
  ],
};
