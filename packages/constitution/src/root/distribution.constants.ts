/** The distribution's map, in the folder of the package that delivers it. */
// Stryker disable next-line StringLiteral: read only by the wiring, which mutation testing leaves out
const DISTRIBUTION_MAP_NAME = 'distribution.json';

/** Where a package the distribution packs declares its build. */
const PACKAGE_BUILDS = [
  {
    keys: [
      'scripts',
      'build',
    ],
    manifestName: 'package.json',
  },
  {
    keys: [
      'tool',
      'poe',
      'tasks',
      'build',
    ],
    manifestName: 'pyproject.toml',
  },
] as const;

export { DISTRIBUTION_MAP_NAME, PACKAGE_BUILDS };
