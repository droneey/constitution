const SPECS = [
  '(^|/)__tests__/',
  '^tests/',
];
const MODULE_LAYERS = 'features|contracts|adapters|shared|libs|composition|integrations';
const LAYERS =
  'root|features|composition|contracts|adapters|kernel|shared|libs|integrations|entrypoints';
// Every role folder the blocks' vocabularies name, which no delivery layer is.
const ROLES =
  'use-cases|entities|value-objects|repositories|errors|constants|types|utils|models|providers|components|widgets|sinks|steps|queries|commands|ui|assets';
const ENTRY = '^src/main\\.[^/]+$';
// A data file in no language, which imports nothing.
const DATA = '\\.(?:json|ya?ml)$';
const ENTRIES = [
  ENTRY,
  '^src/entrypoints/[^/]+/main\\.[^/]+$',
];
const ADAPTERS = [
  '^src/adapters/',
  '^src/features/[^/]+/adapters/',
];
const ROOT = [
  ...ENTRIES,
  '^src/root/',
];
// The delivery layer: a top-level folder, or file, that is no layer or role folder of the tree,
// whatever name its block gives it.
const DELIVERY = [
  `^src/(?!(?:${LAYERS}|${ROLES}|__tests__)/)[^/]+/`,
  '^src/(?!(?:main|index)\\.)[^/]+\\.[^/]+$',
];
const EDGE = [
  ...ADAPTERS,
  ...ROOT,
  ...DELIVERY,
  '^src/(libs|integrations)/',
];
// What a registry installs; the repository's own units are its code, held by the rules between units.
const PACKAGES = [
  'npm',
  'npm-dev',
  'npm-peer',
  'npm-optional',
  'npm-bundled',
];

const ROOT_CALLERS = [
  ...ROOT,
  ...SPECS,
];

export { ADAPTERS, DELIVERY, EDGE, PACKAGES, ROOT, ROOT_CALLERS, SPECS };

// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  // dependency-cruiser takes the severity of the first part in extends with allowed rules, warn by default.
  allowedSeverity: 'error',
  allowed: [
    {
      comment:
        'layer-imports-dependencies-by-its-role: what is no package of a registry, the forbidden rules hold',
      from: {},
      to: {
        dependencyTypesNot: PACKAGES,
      },
    },
    {
      comment: 'layer-imports-dependencies-by-its-role: the edge and the specs import any package',
      from: {
        path: [
          ...EDGE,
          ...SPECS,
        ],
      },
      to: {
        dependencyTypes: PACKAGES,
      },
    },
  ],
  forbidden: [
    {
      name: 'integration-never-imported',
      severity: 'error',
      from: {
        pathNot: [
          '^src/integrations/',
          ...SPECS,
        ],
      },
      to: {
        path: '^src/integrations/',
      },
    },
    {
      name: 'integrations-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^src/integrations/([^/]+)/',
      },
      to: {
        path: '^src/integrations/',
        pathNot: '^src/integrations/$1/',
      },
    },
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
          '^src/contracts/',
        ],
      },
    },
    {
      name: 'feature-root-reached-only-through-its-layers',
      severity: 'error',
      from: {},
      to: {
        path: '^src/features/[^/]+/(?!(?:domain|app|adapters|__tests__)/|index\\.[^/]+$)',
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
        pathNot: [
          '^src/kernel/',
          DATA,
        ],
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
          '^src/(features|kernel|shared|contracts|adapters|root|composition|integrations|entrypoints)/',
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
          '^src/(features|contracts|adapters|root|composition|integrations|entrypoints)/',
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
      name: 'feature-never-imports-a-feature',
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
          '^src/(features|libs|adapters|integrations)/index\\.[^/]+$',
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
        reachable: true,
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
        reachable: true,
      },
    },
  ],
};
