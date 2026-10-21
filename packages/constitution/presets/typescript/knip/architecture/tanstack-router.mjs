// biome-ignore lint/style/noDefaultExport: knip reads a configuration's default export
export default {
  // the file routes, which the router finds by their folder
  entry: [
    'src/root/routes/**/*.{ts,tsx}!',
  ],
};
