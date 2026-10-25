import { describe, expect, it } from 'bun:test';

import { Layer } from '#/kernel/constants';
import { RuleSlug, UnitPath } from '#/kernel/value-objects';

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
  RULE,
  rootCruiser,
  template,
  wiringOf,
} from '../../../../../__tests__/wiring.fixtures';
import type { PlannedFile, PlannedScope, WiringPlan } from '../../../../entities';
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

// A file of the plan, the rule its owner lowers by its slug and its units by their paths.
const plannedFile = (input: {
  file: string;
  isNew: boolean;
  lowers?: string;
  scopes: readonly PlannedScope[];
  units: readonly string[];
}): PlannedFile => ({
  file: input.file,
  isNew: input.isNew,
  ...(input.lowers === undefined
    ? {}
    : {
        lowers: RuleSlug.create(input.lowers),
      }),
  scopes: input.scopes,
  units: input.units.map(UnitPath.create),
});

describe('planPresets', () => {
  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: WiringPlan;
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
      planned: {
        files: [
          plannedFile({
            file: 'biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
        ],
        untemplated: [
          {
            scope: 'typescript',
            tool: 'knip',
          },
        ],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'apps/web/biome.json',
            isNew: false,
            lowers: RULE,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: true,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
    },
    {
      condition: 'two tools have no template',
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
          implementationOf('knip'),
          implementationOf('react-dom'),
        ],
        project: {},
        release: {
          'presets/typescript/knip/foundation/core.json': '{}\n',
          'presets/typescript/react-dom/foundation/core.json': '{}\n',
        },
      },
      planned: {
        files: [],
        untemplated: [
          {
            scope: 'typescript',
            tool: 'knip',
          },
          {
            scope: 'typescript',
            tool: 'react-dom',
          },
        ],
      },
    },
  ])(
    'should mark each file new, lowered or added and list the tools without a template when $condition',
    ({ fixture, planned }) => {
      // Arrange
      const input = wiringOf(fixture);

      // Act
      const plan = planPresets(planInputOf(input));

      // Assert
      expect(plan).toStrictEqual(planned);
    },
  );

  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: WiringPlan;
  }>([
    {
      condition: 'the project keeps no file',
      fixture: {
        project: {},
      },
      planned: {
        files: [
          plannedFile({
            file: '.dependency-cruiser.mjs',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/dependency-cruiser/foundation/self.mjs'),
                      part('typescript/dependency-cruiser/architecture/workspace.mjs'),
                    ],
                    template: template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
                    tool: 'dependency-cruiser',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                      part('typescript/biome/foundation/typescript.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'mise.toml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/osv-scanner/foundation/core.txt'),
                    ],
                    template: template('common/osv-scanner/mise.toml'),
                    tool: 'osv-scanner',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'pyproject.toml',
            isNew: true,
            scopes: [
              {
                scope: 'python',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('python/python/pyproject.toml'),
                    tool: 'python',
                  },
                  {
                    isAdded: false,
                    parts: [
                      part('python/ruff/foundation/self.toml'),
                      part('python/ruff/foundation/core.toml'),
                    ],
                    template: template('python/ruff/pyproject.toml'),
                    tool: 'ruff',
                  },
                  {
                    isAdded: false,
                    parts: [
                      part('python/vulture/foundation/core.toml'),
                    ],
                    template: template('python/vulture/pyproject.toml'),
                    tool: 'vulture',
                  },
                  {
                    isAdded: false,
                    parts: [
                      part('python/import-linter/foundation/core.toml'),
                    ],
                    template: template('python/import-linter/pyproject.toml'),
                    tool: 'import-linter',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'pyproject.toml',
            isNew: true,
            scopes: [
              {
                scope: 'python',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('python/python/pyproject.toml'),
                    tool: 'python',
                  },
                  {
                    isAdded: false,
                    parts: [
                      part('python/vulture/foundation/core.toml'),
                    ],
                    template: template('python/vulture/pyproject.toml'),
                    tool: 'vulture',
                  },
                ],
              },
            ],
            units: [
              '',
              'packages/kit',
            ],
          }),
          plannedFile({
            file: 'packages/kit/pyproject.toml',
            isNew: true,
            scopes: [
              {
                scope: 'python',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('python/python/pyproject.toml'),
                    tool: 'python',
                  },
                  {
                    isAdded: true,
                    parts: [
                      part('python/ruff/foundation/self.toml'),
                      part('python/ruff/foundation/core.toml'),
                    ],
                    template: template('python/ruff/pyproject.toml'),
                    tool: 'ruff',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.dependency-cruiser.mjs',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/dependency-cruiser/foundation/self.mjs'),
                      part('typescript/dependency-cruiser/architecture/workspace.mjs'),
                    ],
                    template: template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
                    tool: 'dependency-cruiser',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/.dependency-cruiser.mjs',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/dependency-cruiser/foundation/self.mjs'),
                      part('typescript/dependency-cruiser/architecture/core.mjs'),
                      part('typescript/dependency-cruiser/architecture/workspace.mjs'),
                    ],
                    template: template('typescript/dependency-cruiser/.dependency-cruiser.mjs'),
                    tool: 'dependency-cruiser',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'acme.toml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      'packs/acme/presets/common/acme/foundation/self.toml',
                    ],
                    template: './packs/acme/templates/project/common/acme/acme.toml',
                    tool: 'acme',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'apps/web/acme.toml',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: true,
                    parts: [
                      'packs/acme/presets/common/acme/foundation/self.toml',
                    ],
                    template: 'apps/web/packs/acme/templates/project/common/acme/acme.toml',
                    tool: 'acme',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'apps/web/acme.toml',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: true,
                    parts: [
                      '../../packs/acme/presets/common/acme/foundation/self.toml',
                    ],
                    template: 'packs/acme/templates/project/common/acme/acme.toml',
                    tool: 'acme',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
    },
  ])("should list the files of the release's tools when $condition", ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const plan = planPresets(planInputOf(input));

    // Assert
    expect(plan).toStrictEqual(planned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: WiringPlan;
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
              'apps/web',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                      part('typescript/biome/foundation/react-dom.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                      part('typescript/biome/foundation/react-dom.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/kit/biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'packages/kit',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
              'apps/web',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'apps/web/biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                      part('typescript/biome/foundation/react-dom.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'a/.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'a/b',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'a/b/biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'a/b',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'apps/web/.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'apps/web/biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: false,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
          plannedFile({
            file: 'apps/web/biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: true,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: true,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              'apps/web',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: '.biomeignore',
            isNew: true,
            scopes: [
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('typescript/biome/.biomeignore'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'biome.json',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/biome/foundation/self.jsonc'),
                    ],
                    template: template('common/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('typescript/biome/foundation/self.jsonc'),
                      part('typescript/biome/foundation/core.jsonc'),
                    ],
                    template: template('typescript/biome/biome.json'),
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
        ],
        untemplated: [],
      },
    },
  ])('should list each file with the units it serves when $condition', ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf({
      blocks: planBlocks,
      release: PLAN_RELEASE,
      ...fixture,
    });

    // Act
    const plan = planPresets(planInputOf(input));

    // Assert
    expect(plan).toStrictEqual(planned);
  });
  it.each<{
    condition: string;
    path: string;
    planned: WiringPlan;
  }>([
    {
      condition: "the tool's bindings alone",
      path: 'presets/typescript/react-dom/foundation/bindings.yaml',
      planned: {
        files: [],
        untemplated: [],
      },
    },
    {
      condition: 'a file in a folder of an axis alone',
      path: 'presets/typescript/react-dom/foundation/plugins/no-enum.grit',
      planned: {
        files: [],
        untemplated: [],
      },
    },
    {
      condition: 'a file in a folder that is no axis alone',
      path: 'presets/typescript/react-dom/notes/core.json',
      planned: {
        files: [],
        untemplated: [],
      },
    },
    {
      condition: 'a file without a name alone',
      path: 'presets/typescript/react-dom/foundation/.json',
      planned: {
        files: [],
        untemplated: [],
      },
    },
    {
      condition: 'a part',
      path: 'presets/typescript/react-dom/foundation/core.json',
      planned: {
        files: [],
        untemplated: [
          {
            scope: 'typescript',
            tool: 'react-dom',
          },
        ],
      },
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
      const plan = planPresets(planInputOf(input));

      // Assert
      expect(plan).toStrictEqual(planned);
    },
  );
  it.each<{
    condition: string;
    fixture: WiringFixture;
    planned: WiringPlan;
  }>([
    {
      condition: 'only the root follows the tool',
      fixture: {},
      planned: {
        files: [
          plannedFile({
            file: 'lefthook.yaml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/lefthook/workflow/biome.yaml'),
                      part('common/lefthook/workflow/ruff.yaml'),
                    ],
                    template: template('common/lefthook/lefthook.yaml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              '',
              'packages/check',
            ],
          }),
          plannedFile({
            file: 'mise.toml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('common/lefthook/mise.toml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              '',
              'packages/check',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [
          plannedFile({
            file: 'lefthook.yaml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/lefthook/workflow/biome.yaml'),
                    ],
                    template: template('common/lefthook/lefthook.yaml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/check/lefthook.yaml',
            isNew: false,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      part('common/lefthook/workflow/ruff.yaml'),
                    ],
                    template: template('common/lefthook/lefthook.yaml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              'packages/check',
            ],
          }),
          plannedFile({
            file: 'mise.toml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('common/lefthook/mise.toml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              '',
            ],
          }),
          plannedFile({
            file: 'packages/check/mise.toml',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [],
                    template: template('common/lefthook/mise.toml'),
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              'packages/check',
            ],
          }),
        ],
        untemplated: [],
      },
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
      planned: {
        files: [],
        untemplated: [],
      },
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
      const plan = planPresets(planInputOf(input));

      // Assert
      expect(plan).toStrictEqual(planned);
    },
  );
});
