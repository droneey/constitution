// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  // the link to the archive a package of a workspace keeps, which a copy into the sandbox cannot follow
  ignorePatterns: [
    '/.droneey',
  ],
};
