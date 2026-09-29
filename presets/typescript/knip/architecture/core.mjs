// biome-ignore lint/style/noDefaultExport: knip reads a configuration's default export
export default {
  entry: [
    'src/entrypoints/*/main.{ts,tsx}!',
    'src/**/index.{ts,tsx}!',
  ],
};
