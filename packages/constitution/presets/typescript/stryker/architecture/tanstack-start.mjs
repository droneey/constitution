// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  mutate: [
    '!src/root/router.{ts,tsx}',
    '!src/root/routes/__root.{ts,tsx}',
  ],
};
