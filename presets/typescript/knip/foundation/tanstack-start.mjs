// biome-ignore lint/style/noDefaultExport: knip reads a configuration's default export
export default {
  entry: [
    'src/router.{ts,tsx}!',
    'src/client.{ts,tsx}!',
  ],
};
