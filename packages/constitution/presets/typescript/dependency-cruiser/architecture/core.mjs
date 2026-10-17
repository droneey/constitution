const SPECS = [
  '(^|/)__tests__/',
  '^tests/',
];
// The layers whose modules are reached through their surfaces.
const MODULE_LAYERS = 'features|adapters|shared|libs|composition|integrations';
// An entry file: the program's main, or another file its framework fixes at the top of the source,
// beside the package's surface; the tree holds no other file there.
const ENTRY = '^src/(?!index\\.)[^/]+\\.[^/]+$';
// A data file in no language, which imports nothing.
const DATA = '\\.(?:json|ya?ml)$';
const ENTRIES = [
  ENTRY,
  '^src/entrypoints/[^/]+/main\\.[^/]+$',
];
const ADAPTERS = [
  '^src/adapters/',
  '^src/(?:features|composition)/[^/]+/adapters/',
];
const ROOT = [
  ...ENTRIES,
  '^src/root/',
];
// The package's surface, which may offer an adapter to the package's consumers.
const PACKAGE_SURFACE = '^src/index\\.[^/]+$';
const EDGE = [
  ...ADAPTERS,
  ...ROOT,
  '^src/(libs|integrations)/',
];
const IO =
  '^(?:node:)?(?:child_process|cluster|dgram|dns|fs|http|http2|https|inspector|module|net|os|perf_hooks|process|quic|readline|repl|sqlite|tls|trace_events|tty|v8|vm|wasi|worker_threads)(?:/|$)';
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

export { ADAPTERS, EDGE, PACKAGE_SURFACE, PACKAGES, ROOT, ROOT_CALLERS, SPECS };

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
      name: 'domain-reaches-only-itself-and-the-kernel',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)/domain/',
        pathNot: SPECS,
      },
      to: {
        dependencyTypesNot: [
          'core',
        ],
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
        dependencyTypesNot: [
          'core',
        ],
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
          '^src/(features|kernel|shared|adapters|root|composition|integrations|entrypoints)/',
          ENTRY,
        ],
      },
    },
    {
      name: 'shared-knows-no-feature-adapter-contract-or-root',
      severity: 'error',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: [
          '^src/(features|adapters|root|composition|integrations|entrypoints)/',
          '^src/kernel/contracts/',
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
      name: 'composition-module-never-imports-another',
      severity: 'error',
      from: {
        path: '^src/composition/([^/]+)/',
      },
      to: {
        path: '^src/composition/',
        pathNot: '^src/composition/$1/',
      },
    },
    {
      name: 'features-know-no-composition',
      severity: 'error',
      from: {
        path: '^src/features/',
      },
      to: {
        path: '^src/composition/',
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
        pathNot: [
          `^src/(${MODULE_LAYERS})/[^/]+/index\\.[^/]+$`,
          // The root reaches a module's adapter through the adapter's own surface.
          '^src/(features|composition)/[^/]+/adapters/[^/]+/index\\.[^/]+$',
        ],
      },
    },
    {
      name: 'kernel-role-reached-through-its-surface',
      severity: 'error',
      from: {
        pathNot: '^src/kernel/',
      },
      to: {
        path: '^src/kernel/',
        pathNot: '^src/kernel/[^/]+/index\\.[^/]+$',
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
        path: '^src/(features|composition)/([^/]+)/(?!domain/)',
      },
      to: {
        path: '^src/$1/$2/domain/[^/]+/',
        pathNot: '^src/$1/$2/domain/.*/index\\.[^/]+$',
      },
    },
    {
      name: 'domain-role-reaches-a-sibling-through-its-surface',
      severity: 'error',
      from: {
        path: '^src/(features|composition)/([^/]+)/domain/([^/]+)/',
      },
      to: {
        path: '^src/$1/$2/domain/(?!$3/)[^/]+/',
        pathNot: '^src/$1/$2/domain/.*/index\\.[^/]+$',
      },
    },
    {
      name: 'kernel-role-reaches-a-sibling-through-its-surface',
      severity: 'error',
      from: {
        path: '^src/kernel/([^/]+)/',
      },
      to: {
        path: '^src/kernel/(?!$1/)[^/]+/',
        pathNot: '^src/kernel/[^/]+/index\\.[^/]+$',
      },
    },
    {
      name: 'effects-reached-only-from-the-edge',
      severity: 'error',
      from: {
        path: '^src/',
        pathNot: [
          ...EDGE,
          ...SPECS,
          PACKAGE_SURFACE,
        ],
      },
      to: {
        path: IO,
        reachable: true,
      },
    },
    {
      name: 'layer-folder-never-a-target',
      severity: 'error',
      from: {},
      to: {
        path: [
          '^src/index\\.[^/]+$',
          '^src/(features|libs|adapters|integrations|kernel|shared|composition)/index\\.[^/]+$',
          '^src/(features|composition)/[^/]+/(domain|app|adapters)/index\\.[^/]+$',
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
        path: '^src/(features|composition)/([^/]+)/adapters/([^/]+)/',
      },
      to: {
        path: ADAPTERS,
        pathNot: '^src/$1/$2/adapters/$3/',
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
          '^src/(features|composition)/[^/]+/app/',
          '^src/(root|entrypoints)/',
          ENTRY,
        ],
      },
    },
    {
      // Composition implements a feature's contract through another feature's surface; no other adapter reaches one.
      name: 'adapters-outside-composition-know-no-feature-or-composition',
      severity: 'error',
      from: {
        path: [
          '^src/adapters/',
          '^src/features/[^/]+/adapters/',
        ],
      },
      to: {
        path: [
          // A feature's surface offers its binding units, which an adapter never calls.
          '^src/features/[^/]+/index\\.[^/]+$',
          '^src/composition/',
        ],
      },
    },
    {
      name: 'adapters-reached-only-from-the-root',
      severity: 'error',
      from: {
        pathNot: [
          ...ADAPTERS,
          '^src/root/',
          ...SPECS,
          // The surface of a package offers its adapters to its consumers.
          PACKAGE_SURFACE,
        ],
      },
      to: {
        path: ADAPTERS,
      },
    },
    {
      name: 'binding-units-reach-no-port',
      severity: 'error',
      from: {
        path: '^src/(features|composition)/([^/]+)/app/',
        pathNot: SPECS,
      },
      to: {
        path: '^src/$1/$2/domain/contracts/',
      },
    },
    {
      name: 'root-wires-without-a-container-library',
      severity: 'error',
      from: {},
      to: {
        path: 'node_modules/(?:inversify|tsyringe|awilix|typedi|typed-inject|brandi)/',
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
