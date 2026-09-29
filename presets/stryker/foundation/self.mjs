// biome-ignore lint/style/noDefaultExport: Stryker reads a configuration's default export
export default {
  testRunner: 'command',
  coverageAnalysis: 'off',
  ignorePatterns: [
    '/.constitution',
  ],
  reporters: [
    'clear-text',
  ],
  clearTextReporter: {
    allowColor: false,
    logTests: false,
  },
  tempDirName: '.stryker-tmp',
  // TypeScript 7 has no parseConfigFileTextToJson: a missing file keeps Stryker from rewriting tsconfig.
  tsconfigFile: 'stryker-has-no-tsconfig.json',
  // biome-ignore lint/style/useNamingConvention: Stryker names the option timeoutMS
  timeoutMS: 30_000,
};
