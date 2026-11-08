const BROWSER_APP_WITH_PACK_AND_OVERRIDE_NAMES = [
  'analytics',
  'i18n',
  'remote-data',
  'ui',
  'unreliable-network',
  'untrusted-client',
  'version-control',
  'browser',
  'typescript',
  'betterleaks',
  'biome',
  'git',
  'lefthook',
  'matomo',
  'react',
  'react/react-dom',
  'tanstack-query',
  'paraglide',
  'pack',
] as const;

const EVERY_CODE_NAMES = [
  'analytics',
  'ui',
  'version-control',
  'typescript',
  'git',
  'matomo',
  'react',
  'react/react-dom',
] as const;

const EVERY_CODE_WARNINGS = [
  [
    'config',
    'platforms',
  ],
  [
    'blocks',
    'tanstak-query',
  ],
  [
    'blocks',
    'ui',
  ],
  [
    'requirements',
    'react/react-dom',
    'browser',
  ],
  [
    'overrides',
    'four-data-states',
    '2020-01-01',
  ],
  [
    'installation',
    'packs/gone',
  ],
] as const;

export { BROWSER_APP_WITH_PACK_AND_OVERRIDE_NAMES, EVERY_CODE_NAMES, EVERY_CODE_WARNINGS };
