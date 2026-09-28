const SPECS = '(^|/)__tests__/';
const MODULE_LAYERS = 'features|contracts|adapters|shared|libs|composition';
const ENTRY = '^src/main\\.[^/]+$';
const ADAPTERS = [
  '^src/adapters/',
  '^src/features/[^/]+/adapters/',
];

export const ROOT_CALLERS = [
  ENTRY,
  '^src/entrypoints/[^/]+/main\\.[^/]+$',
  '^src/root/',
  SPECS,
];

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'domain-reaches-only-itself-and-kernel',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/domain/',
        pathNot: SPECS,
      },
      to: {
        pathNot: [
          '^src/features/$1/domain/',
          '^src/kernel/',
        ],
      },
    },
    {
      name: 'kernel-reaches-only-itself',
      severity: 'error',
      from: {
        path: '^src/kernel/',
        pathNot: SPECS,
      },
      to: {
        pathNot: '^src/kernel/',
      },
    },
    {
      name: 'libs-know-no-application',
      severity: 'error',
      from: {
        path: '^src/libs/',
      },
      to: {
        path: [
          '^src/(features|kernel|shared|contracts|adapters|root|composition|entrypoints)/',
          ENTRY,
        ],
      },
    },
    {
      name: 'shared-knows-no-feature-or-root',
      severity: 'error',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: [
          '^src/(features|root|composition|entrypoints)/',
          ENTRY,
        ],
      },
    },
    {
      name: 'root-reached-only-from-entries',
      severity: 'error',
      from: {
        pathNot: ROOT_CALLERS,
      },
      to: {
        path: '^src/root/',
      },
    },
    {
      name: 'entry-never-imported',
      severity: 'error',
      from: {},
      to: {
        path: ENTRY,
      },
    },
    {
      name: 'entrypoint-reached-only-from-itself',
      severity: 'error',
      from: {
        pathNot: '^src/entrypoints/',
      },
      to: {
        path: '^src/entrypoints/',
      },
    },
    {
      name: 'entrypoints-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^src/entrypoints/([^/]+)/',
      },
      to: {
        path: '^src/entrypoints/',
        pathNot: '^src/entrypoints/$1/',
      },
    },
    {
      name: 'features-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/',
      },
      to: {
        path: '^src/features/',
        pathNot: '^src/features/$1/',
      },
    },
    {
      name: 'module-reached-through-its-surface',
      severity: 'error',
      from: {
        path: `^(src/(${MODULE_LAYERS})/[^/]+)/`,
      },
      to: {
        path: `^src/(${MODULE_LAYERS})/[^/]+/`,
        pathNot: [
          '^$1/',
          `^src/(${MODULE_LAYERS})/[^/]+/index\\.[^/]+$`,
        ],
      },
    },
    {
      name: 'module-reached-through-its-surface-from-outside-modules',
      severity: 'error',
      from: {
        pathNot: `^src/(${MODULE_LAYERS})/[^/]+/`,
      },
      to: {
        path: `^src/(${MODULE_LAYERS})/[^/]+/`,
        pathNot: `^src/(${MODULE_LAYERS})/[^/]+/index\\.[^/]+$`,
      },
    },
    {
      name: 'kernel-reached-through-its-surface',
      severity: 'error',
      from: {
        pathNot: '^src/kernel/',
      },
      to: {
        path: '^src/kernel/',
        pathNot: '^src/kernel/index\\.[^/]+$',
      },
    },
    {
      name: 'module-never-imports-its-own-surface',
      severity: 'error',
      from: {
        path: `^src/(${MODULE_LAYERS})/([^/]+)/`,
      },
      to: {
        path: '^src/$1/$2/index\\.[^/]+$',
      },
    },
    {
      name: 'domain-role-reached-through-its-surface',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/(?!domain/)',
      },
      to: {
        path: '^src/features/$1/domain/[^/]+/',
        pathNot: '^src/features/$1/domain/.*/index\\.[^/]+$',
      },
    },
    {
      name: 'layer-folder-never-a-target',
      severity: 'error',
      from: {},
      to: {
        path: [
          '^src/index\\.[^/]+$',
          '^src/(features|libs|adapters)/index\\.[^/]+$',
          '^src/features/[^/]+/(domain|app|adapters)/index\\.[^/]+$',
        ],
      },
    },
    {
      name: 'contract-knows-only-itself-and-kernel',
      severity: 'error',
      from: {
        path: '^src/contracts/([^/]+)/',
        pathNot: SPECS,
      },
      to: {
        pathNot: [
          '^src/contracts/$1/',
          '^src/contracts/[^/]+/index\\.[^/]+$',
          '^src/kernel/',
        ],
      },
    },
    {
      name: 'adapters-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^src/adapters/([^/]+)/',
      },
      to: {
        path: ADAPTERS,
        pathNot: '^src/adapters/$1/',
      },
    },
    {
      name: 'feature-adapters-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/adapters/([^/]+)/',
      },
      to: {
        path: ADAPTERS,
        pathNot: '^src/features/$1/adapters/$2/',
      },
    },
    {
      name: 'adapters-know-no-caller',
      severity: 'error',
      from: {
        path: ADAPTERS,
      },
      to: {
        path: [
          '^src/features/[^/]+/app/',
          '^src/(root|composition|entrypoints)/',
          ENTRY,
        ],
      },
    },
    {
      name: 'reads-never-reach-writes',
      severity: 'error',
      from: {
        path: '/(use-cases|repositories)/queries/',
      },
      to: {
        path: '/(use-cases|repositories)/commands/',
      },
    },
    {
      name: 'writes-never-reach-reads',
      severity: 'error',
      from: {
        path: '/(use-cases|repositories)/commands/',
      },
      to: {
        path: '/(use-cases|repositories)/queries/',
      },
    },
  ],
};
