import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';

import type { Files, WiringFixture } from '../../../../../__tests__/wiring.fixtures';
import {
  biomeJson,
  HOOKS_RELEASE,
  hooksBlocks,
  hooksMember,
  hooksOf,
  hooksOwnUnits,
  hooksUnits,
  implementationOf,
  packageCruiser,
  packFilesIn,
  part,
  planInputOf,
  plannedOf,
  REACT_DOM,
  RULE,
  rootCruiser,
  template,
  wiringOf,
} from '../../../../../__tests__/wiring.fixtures';
import { planPresets } from '../plan.use-case';

// A member's acme.toml that takes no part yet.
const MEMBER_ACME: Files = {
  'apps/web/acme.toml': 'extends = ""\n',
} as const;

const acmeOnly = [
  {
    id: 'core',
    layer: Layer.Core,
  },
  implementationOf('acme'),
];

// The repository, which takes no acme, and its member, which does.
const acmeUnits = [
  {
    blocks: [
      'core',
    ],
  },
  {
    blocks: [
      'core',
      'acme',
    ],
    path: 'apps/web',
  },
];

// Biome's templates, one at a path of its own, and parts of a tool that has no template.
const PLAN_RELEASE: Files = {
  'templates/project/typescript/biome/.biomeignore': 'dist\n',
  'templates/project/typescript/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'templates/project/common/biome/biome.json': '{ "extends": ["<parts>"] }\n',
  'presets/typescript/biome/foundation/react-dom.jsonc': '{}\n',
  'presets/typescript/biome/foundation/core.jsonc': '{}\n',
  'presets/typescript/biome/foundation/self.jsonc': '{}\n',
  'presets/common/biome/foundation/self.jsonc': '{}\n',
  'presets/typescript/knip/foundation/core.json': '{}\n',
} as const;
const planBlocks = [
  {
    id: 'core',
    layer: Layer.Core,
  },
  {
    id: 'typescript',
    layer: Layer.Language,
  },
  implementationOf('biome'),
  implementationOf('knip'),
  implementationOf('react-dom'),
];
const planParts = [
  'common/biome/foundation/self.jsonc',
  'typescript/biome/foundation/self.jsonc',
  'typescript/biome/foundation/core.jsonc',
];
const planIds = [
  'core',
  'typescript',
  'biome',
];
const planFiles: Files = {
  '.biomeignore': 'dist\n',
  'biome.json': biomeJson(planParts),
};

describe('planPresets', () => {
  it.each<{
    condition: string;
    fixture: WiringFixture;
    lines: string[];
  }>([
    {
      condition: 'the project keeps no file and a tool has no template',
      fixture: {
        blocks: [
          {
            id: 'core',
            layer: Layer.Core,
          },
          {
            id: 'typescript',
            layer: Layer.Language,
          },
          implementationOf('biome'),
          implementationOf('knip'),
        ],
        project: {},
        release: {
          'presets/common/biome/foundation/self.jsonc': '{}\n',
          'presets/typescript/knip/foundation/core.json': '{}\n',
          'templates/project/common/biome/biome.json': '{ "extends": ["<parts>"] }\n',
        },
        units: [
          {},
          {
            path: 'packages/kit',
          },
        ],
      },
      lines: [
        'biome.json (new) for .',
        '  biome .droneey/constitution/templates/project/common/biome/biome.json',
        '    .droneey/constitution/presets/common/biome/foundation/self.jsonc',
        'packages/kit/biome.json (new) for packages/kit',
        '  biome .droneey/constitution/templates/project/common/biome/biome.json',
        '    .droneey/constitution/presets/common/biome/foundation/self.jsonc',
        'no template: typescript/knip — wire presets/typescript/knip/ from what the tool reads',
      ],
    },
    {
      condition: 'a package adds a tool and its overrides lower the rule',
      fixture: {
        blocks: [
          {
            id: 'core',
            layer: Layer.Core,
          },
          {
            id: 'typescript',
            layer: Layer.Language,
          },
          implementationOf('biome'),
        ],
        project: {
          'apps/web/biome.json': '{}\n',
        },
        release: {
          'presets/common/biome/foundation/self.jsonc': '{}\n',
          'templates/project/common/biome/biome.json': '{ "extends": ["<parts>"] }\n',
        },
        units: [
          {
            blocks: [
              'core',
              'typescript',
            ],
          },
          {
            blocks: [
              'core',
              'typescript',
              'biome',
            ],
            lowered: [
              RULE,
            ],
            path: 'apps/web',
          },
        ],
      },
      lines: [
        'apps/web/biome.json for apps/web (its overrides lower configuration-takes-every-part-of-its-blocks)',
        '  biome .droneey/constitution/templates/project/common/biome/biome.json (the folder adds it)',
        '    .droneey/constitution/presets/common/biome/foundation/self.jsonc',
      ],
    },
  ])('should word each line as its format pins when $condition', ({ fixture, lines }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const planned = planPresets(planInputOf(input));

    // Assert
    expect(planned).toStrictEqual(lines);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: string[][];
  }>([
    {
      condition: 'the project keeps no file',
      fixture: {
        project: {},
      },
      planned: [
        [
          '.dependency-cruiser.mjs',
          'new',
          '.',
        ],
        [
          'dependency-cruiser',
          template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/foundation/self.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/architecture/workspace.mjs'),
        ],
        [
          'biome.json',
          'new',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          part('typescript/biome/foundation/typescript.jsonc'),
        ],
        [
          'mise.toml',
          'new',
          '.',
        ],
        [
          'osv-scanner',
          template('common/osv-scanner/mise.toml'),
        ],
        [
          part('common/osv-scanner/foundation/core.txt'),
        ],
        [
          'pyproject.toml',
          'new',
          '.',
        ],
        [
          'python',
          template('python/python/pyproject.toml'),
        ],
        [
          'ruff',
          template('python/ruff/pyproject.toml'),
        ],
        [
          part('python/ruff/foundation/self.toml'),
        ],
        [
          part('python/ruff/foundation/core.toml'),
        ],
        [
          'vulture',
          template('python/vulture/pyproject.toml'),
        ],
        [
          part('python/vulture/foundation/core.toml'),
        ],
        [
          'import-linter',
          template('python/import-linter/pyproject.toml'),
        ],
        [
          part('python/import-linter/foundation/core.toml'),
        ],
      ],
    },
    {
      condition: 'two units take the tools of one file apart',
      fixture: {
        project: {},
        units: [
          {
            blocks: [
              'core',
              'python',
              'vulture',
            ],
          },
          {
            blocks: [
              'core',
              'python',
              'ruff',
            ],
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          'pyproject.toml',
          'new',
          '.',
          'packages/kit',
        ],
        [
          'python',
          template('python/python/pyproject.toml'),
        ],
        [
          'vulture',
          template('python/vulture/pyproject.toml'),
        ],
        [
          part('python/vulture/foundation/core.toml'),
        ],
        [
          'packages/kit/pyproject.toml',
          'new',
          'packages/kit',
        ],
        [
          'python',
          template('python/python/pyproject.toml'),
        ],
        [
          'ruff',
          template('python/ruff/pyproject.toml'),
          'adds',
        ],
        [
          part('python/ruff/foundation/self.toml'),
        ],
        [
          part('python/ruff/foundation/core.toml'),
        ],
      ],
    },
    {
      condition: 'a package keeps a file of a tool with a workspace part',
      fixture: {
        project: {
          '.dependency-cruiser.mjs': rootCruiser,
          'packages/kit/.dependency-cruiser.mjs': packageCruiser,
        },
        release: {
          'presets/typescript/dependency-cruiser/architecture/core.mjs': 'export default {};\n',
          'presets/typescript/dependency-cruiser/architecture/workspace.mjs':
            'export default {};\n',
          'presets/typescript/dependency-cruiser/foundation/self.mjs': 'export default {};\n',
          'templates/project/typescript/dependency-cruiser/.dependency-cruiser.mjs':
            "export default { extends: ['<parts>'] };\n",
        },
        units: [
          {},
          {
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          '.dependency-cruiser.mjs',
          '.',
        ],
        [
          'dependency-cruiser',
          template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/foundation/self.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/architecture/workspace.mjs'),
        ],
        [
          'packages/kit/.dependency-cruiser.mjs',
          'packages/kit',
        ],
        [
          'dependency-cruiser',
          template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/foundation/self.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/architecture/core.mjs'),
        ],
        [
          part('typescript/dependency-cruiser/architecture/workspace.mjs'),
        ],
      ],
    },
    {
      condition: "a pack holds a tool's template and its part",
      fixture: {
        blocks: [
          {
            id: 'core',
            layer: Layer.Core,
          },
          implementationOf('acme'),
        ],
        packs: [
          './packs/acme',
        ],
        project: {
          'packs/acme/presets/common/acme/foundation/self.toml': 'strict = true\n',
          'packs/acme/templates/project/common/acme/acme.toml': 'extends = "<parts>"\n',
        },
        release: {},
      },
      planned: [
        [
          'acme.toml',
          'new',
          '.',
        ],
        [
          'acme',
          './packs/acme/templates/project/common/acme/acme.toml',
        ],
        [
          'packs/acme/presets/common/acme/foundation/self.toml',
        ],
      ],
    },
    {
      condition:
        "a member lists a pack in its own folder, which holds a tool's template and its part",
      fixture: {
        blocks: acmeOnly,
        packs: [
          'apps/web/packs/acme',
        ],
        project: {
          ...packFilesIn('apps/web/packs'),
          ...MEMBER_ACME,
        },
        release: {},
        units: acmeUnits,
      },
      planned: [
        [
          'apps/web/acme.toml',
          'apps/web',
        ],
        [
          'acme',
          'apps/web/packs/acme/templates/project/common/acme/acme.toml',
          'adds',
        ],
        [
          'packs/acme/presets/common/acme/foundation/self.toml',
        ],
      ],
    },
    {
      condition:
        "a member lists a pack the repository keeps, which holds a tool's template and its part",
      fixture: {
        blocks: acmeOnly,
        packs: [
          'packs/acme',
        ],
        project: {
          ...packFilesIn('packs'),
          ...MEMBER_ACME,
        },
        release: {},
        units: acmeUnits,
      },
      planned: [
        [
          'apps/web/acme.toml',
          'apps/web',
        ],
        [
          'acme',
          'packs/acme/templates/project/common/acme/acme.toml',
          'adds',
        ],
        [
          '../../packs/acme/presets/common/acme/foundation/self.toml',
        ],
      ],
    },
  ])("should list the files of the release's tools when $condition", ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const lines = planPresets(planInputOf(input));

    // Assert
    expect(plannedOf(lines)).toStrictEqual(planned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: string[][];
  }>([
    {
      condition: 'the repository keeps its files',
      fixture: {
        project: {
          '.biomeignore': 'dist\n',
          'biome.json': biomeJson(planParts),
        },
        units: [
          {
            blocks: planIds,
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: 'the repository keeps a file that names no part',
      fixture: {
        project: {
          '.biomeignore': 'dist\n',
          'biome.json': '{}\n',
        },
        units: [
          {
            blocks: planIds,
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: 'a package takes no tool of the file',
      fixture: {
        project: planFiles,
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: [
              'core',
              'typescript',
              'react-dom',
            ],
            path: 'apps/web',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
          'apps/web',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
          'apps/web',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          part(REACT_DOM),
        ],
      ],
    },
    {
      condition: 'a block is named self',
      fixture: {
        blocks: [
          ...planBlocks,
          implementationOf('self'),
        ],
        project: planFiles,
        units: [
          {
            blocks: [
              ...planIds,
              'self',
            ],
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: "a template sits in a scope's folder",
      fixture: {
        project: planFiles,
        release: {
          ...PLAN_RELEASE,
          'templates/project/common/react-dom': 'react\n',
        },
        units: [
          {
            blocks: [
              ...planIds,
              'react-dom',
            ],
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          part('typescript/biome/foundation/react-dom.jsonc'),
        ],
      ],
    },
    {
      condition: 'a package keeps a file of the name and the repository none',
      fixture: {
        project: {
          'packages/kit/biome.json': '{}\n',
        },
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: planIds,
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'packages/kit/.biomeignore',
          'new',
          'packages/kit',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          'new',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          'packages/kit/biome.json',
          'packages/kit',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: 'no unit takes the tool',
      fixture: {
        project: {},
        units: [
          {
            blocks: [
              'core',
              'typescript',
            ],
          },
        ],
      },
      planned: [],
    },
    {
      condition: 'a package keeps a file that names no part',
      fixture: {
        project: {
          'biome.json': biomeJson(planParts),
          'packages/kit/biome.json': '{ "root": false }\n',
        },
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: planIds,
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'packages/kit/.biomeignore',
          'new',
          'packages/kit',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          'packages/kit/biome.json',
          'packages/kit',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: 'a package keeps a file that names the parts of a block it adds',
      fixture: {
        project: {
          '.biomeignore': 'dist\n',
          'apps/web/biome.json': biomeJson([
            ...planParts,
            'typescript/biome/foundation/react-dom.jsonc',
          ]),
          'biome.json': biomeJson(planParts),
        },
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: [
              ...planIds,
              'react-dom',
            ],
            path: 'apps/web',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
          'apps/web',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          'apps/web/biome.json',
          'apps/web',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          part('typescript/biome/foundation/react-dom.jsonc'),
        ],
      ],
    },
    {
      condition: 'a folder between a unit and the root keeps a file of the name',
      fixture: {
        project: {
          'a/.biomeignore': 'dist\n',
          'a/biome.json': '{}\n',
        },
        tracked: [
          'a/biome.json',
          'a/.biomeignore',
        ],
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: planIds,
            path: 'a/b',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'a/.biomeignore',
          'a/b',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          'new',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          'a/b/biome.json',
          'new',
          'a/b',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: 'a member keeps a file of the name in its own folder and the root one of its own',
      fixture: {
        project: {
          '.biomeignore': 'dist\n',
          'apps/web/.biomeignore': 'dist\n',
          'apps/web/biome.json': biomeJson(planParts),
          'biome.json': biomeJson(planParts),
        },
        units: [
          {
            blocks: planIds,
          },
          {
            blocks: planIds,
            path: 'apps/web',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'apps/web/.biomeignore',
          'apps/web',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
        [
          'apps/web/biome.json',
          'apps/web',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition:
        'a member reads by its name the file the root keeps for a tool the root does not follow',
      fixture: {
        project: {
          '.biomeignore': 'dist\n',
          'apps/web/biome.json': biomeJson(planParts),
        },
        units: [
          {
            blocks: [
              'core',
              'typescript',
            ],
          },
          {
            blocks: planIds,
            path: 'apps/web',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'apps/web',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'apps/web/biome.json',
          'apps/web',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
          'adds',
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
          'adds',
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
    {
      condition: "a file of another name lies where a template's path would cut the root's folder",
      fixture: {
        project: {
          'ab/biome.json': '{}\n',
          'biome.json': biomeJson(planParts),
        },
        tracked: [
          'ab/biome.json',
        ],
        units: [
          {
            blocks: planIds,
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
        ],
        [
          'biome',
          template('common/biome/biome.json'),
        ],
        [
          part('common/biome/foundation/self.jsonc'),
        ],
        [
          'biome',
          template('typescript/biome/biome.json'),
        ],
        [
          part('typescript/biome/foundation/self.jsonc'),
        ],
        [
          part('typescript/biome/foundation/core.jsonc'),
        ],
      ],
    },
  ])('should list each file with the units it serves when $condition', ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf({
      blocks: planBlocks,
      release: PLAN_RELEASE,
      ...fixture,
    });

    // Act
    const lines = planPresets(planInputOf(input));

    // Assert
    expect(plannedOf(lines)).toStrictEqual(planned);
  });
  it.each<{
    condition: string;
    path: string;
    planned: string[][];
  }>([
    {
      condition: "the tool's bindings alone",
      path: 'presets/typescript/react-dom/foundation/bindings.yaml',
      planned: [],
    },
    {
      condition: 'a file in a folder of an axis alone',
      path: 'presets/typescript/react-dom/foundation/plugins/no-enum.grit',
      planned: [],
    },
    {
      condition: 'a file in a folder that is no axis alone',
      path: 'presets/typescript/react-dom/notes/core.json',
      planned: [],
    },
    {
      condition: 'a file without a name alone',
      path: 'presets/typescript/react-dom/foundation/.json',
      planned: [],
    },
    {
      condition: 'a part',
      path: 'presets/typescript/react-dom/foundation/core.json',
      planned: [
        [
          'typescript/react-dom',
          'presets/typescript/react-dom/',
        ],
      ],
    },
  ])(
    'should list a tool that has no template when its presets hold $condition',
    ({ path, planned }) => {
      // Arrange
      const input = wiringOf({
        blocks: planBlocks,
        project: {},
        release: {
          [path]: '{}\n',
        },
        units: [
          {
            blocks: [
              'core',
              'typescript',
              'react-dom',
            ],
          },
        ],
      });

      // Act
      const lines = planPresets(planInputOf(input));

      // Assert
      expect(plannedOf(lines)).toStrictEqual(planned);
    },
  );
  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: string[][];
  }>([
    {
      condition: 'only the root follows the tool',
      fixture: {},
      planned: [
        [
          'lefthook.yaml',
          'new',
          '.',
          'packages/check',
        ],
        [
          template('common/lefthook/lefthook.yaml'),
        ],
        [
          part('common/lefthook/workflow/biome.yaml'),
        ],
        [
          part('common/lefthook/workflow/ruff.yaml'),
        ],
        [
          'mise.toml',
          'new',
          '.',
          'packages/check',
        ],
        [
          template('common/lefthook/mise.toml'),
        ],
      ],
    },
    {
      condition:
        'a member that follows the tool keeps its own file and one that does not runs a tool with its part',
      fixture: {
        project: {
          'packages/check/lefthook.yaml': hooksOf([
            'ruff',
          ]),
        },
        units: hooksOwnUnits,
      },
      planned: [
        [
          'lefthook.yaml',
          'new',
          '.',
        ],
        [
          template('common/lefthook/lefthook.yaml'),
        ],
        [
          part('common/lefthook/workflow/biome.yaml'),
        ],
        [
          'packages/check/lefthook.yaml',
          'packages/check',
        ],
        [
          template('common/lefthook/lefthook.yaml'),
        ],
        [
          part('common/lefthook/workflow/ruff.yaml'),
        ],
        [
          'mise.toml',
          'new',
          '.',
        ],
        [
          template('common/lefthook/mise.toml'),
        ],
        [
          'packages/check/mise.toml',
          'new',
          'packages/check',
        ],
        [
          template('common/lefthook/mise.toml'),
        ],
      ],
    },
    {
      condition: 'no unit follows the tool',
      fixture: {
        units: [
          {
            blocks: [
              'core',
              'typescript',
              'biome',
            ],
          },
          hooksMember,
        ],
      },
      planned: [],
    },
  ])(
    "should list the root's file of a tool no member follows with every unit, and of one a member follows with the root alone, when $condition",
    ({ fixture, planned }) => {
      // Arrange
      const input = wiringOf({
        blocks: hooksBlocks,
        project: {},
        release: HOOKS_RELEASE,
        units: hooksUnits,
        ...fixture,
      });

      // Act
      const lines = planPresets(planInputOf(input));

      // Assert
      expect(plannedOf(lines)).toStrictEqual(planned);
    },
  );
});
