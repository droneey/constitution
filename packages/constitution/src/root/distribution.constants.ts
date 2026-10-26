// Stryker disable all: read only by the wiring, which mutation testing leaves out
/** The distribution's map, in the folder of the package that delivers it. */
const DISTRIBUTION_MAP = 'distribution.json';

/** Where a package the distribution packs declares its build. */
const PACKAGE_BUILDS = [
  {
    keys: [
      'scripts',
      'build',
    ],
    manifest: 'package.json',
  },
  {
    keys: [
      'tool',
      'poe',
      'tasks',
      'build',
    ],
    manifest: 'pyproject.toml',
  },
] as const;

export { DISTRIBUTION_MAP, PACKAGE_BUILDS };
