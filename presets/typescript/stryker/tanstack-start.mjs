// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    '!src/router.{ts,tsx}',
    '!src/client.{ts,tsx}',
  ],
};
