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
  '_react',
  'betterleaks',
  'biome',
  'git',
  'lefthook',
  'matomo',
  'react-dom',
  'tanstack-query',
  'paraglide',
  'pack',
] as const;

const EVERY_CODE_NAMES = [
  'analytics',
  'ui',
  'version-control',
  'typescript',
  '_react',
  'git',
  'matomo',
  'react-dom',
] as const;

const EVERY_CODE_WARNINGS = [
  [
    'config',
    'platforms',
  ],
  [
    'blocks',
    '_react',
    'react-dom',
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
    'react-dom',
    'browser',
  ],
  [
    'requirements',
    'matomo',
    'analytics-consent-first',
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
