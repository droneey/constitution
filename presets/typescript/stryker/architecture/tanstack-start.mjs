// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    '!src/routes/__root.{ts,tsx}',
  ],
};
