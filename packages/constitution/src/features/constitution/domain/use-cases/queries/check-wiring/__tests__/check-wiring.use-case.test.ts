import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';

import type { ProjectWarning } from '../../../../entities';
import { WarningCode } from '../../../../entities';
import { checkWiring, planWiring } from '../check-wiring.use-case';
import type { Files, WiringFixture } from './wiring.fixtures';
import {
  BIOME_PARTS,
  BLOCKS,
  biomeJson,
  IMPORT_LINTER,
  IMPORT_LINTER_COPY,
  implementationOf,
  PACKAGE_CRUISER,
  PYPROJECT,
  packOf,
  part,
  plannedOf,
  RELEASE,
  ROOT_CRUISER,
  RUFF,
  RULE,
  ruffConfig,
  template,
  UNBIOMED,
  VULTURE,
  VULTURE_COPY,
  vultureCopy,
  WIRED,
  warnedOf,
  wiringOf,
} from './wiring.fixtures';

const IDS: readonly string[] = BLOCKS.map((block) => block.id);
const REACT_DOM = 'typescript/biome/foundation/react-dom.jsonc';
const WITH_REACT_DOM = [
  ...BLOCKS,
  implementationOf('react-dom'),
];
const WEB_UNITS = [
  {
    blocks: IDS,
  },
  {
    blocks: [
      ...IDS,
      'react-dom',
    ],
    path: 'apps/web',
  },
];
const CHAINED = [
  ...BLOCKS,
  implementationOf('pytest'),
  implementationOf('fastapi'),
];

const EDITED = [
  [
    'wiring',
    'pyproject.toml',
    'python/foundation/core',
  ],
];

// A pack the project keeps in packs/acme: a part of Biome for its block acme, and acme as a tool
// of its own, whose template takes its part.
const ACME_SELF = 'packs/acme/presets/common/acme/foundation/self.toml';
const PACK_FILES: Files = {
  [ACME_SELF]: 'strict = true\n',
  'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
  'packs/acme/templates/project/common/acme/acme.toml': 'extends = "<parts>"\n',
};
const ACME_BIOME = `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`;

const pyprojectOf = (input: { linter?: string; ruff?: string; vulture?: string }): Files => ({
  ...WIRED,
  'pyproject.toml': `${input.ruff ?? RUFF}\n${input.vulture ?? VULTURE_COPY}\n${input.linter ?? IMPORT_LINTER_COPY}`,
});

describe('checkWiring', () => {
  it.each<{
    condition: string;
    fixture: WiringFixture;
    warnings: ProjectWarning[];
  }>([
    {
      condition: 'no file names the parts of a tool the repository takes',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': '{}\n',
        },
      },
      warnings: [
        {
          code: WarningCode.Wiring,
          message: 'biome is wired nowhere for . — run /constitution:ratify',
        },
      ],
    },
    {
      condition: 'a folder no unit names keeps a file that takes parts',
      fixture: {
        project: {
          ...WIRED,
          'tools/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'tools/biome.json',
        ],
      },
      warnings: [
        {
          code: WarningCode.Unlisted,
          message: 'tools keeps its own biome.json — list it under packages: in constitution.yaml',
        },
      ],
    },
    {
      condition: 'a file lacks more than three parts and names more than three beyond them',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            REACT_DOM,
            'typescript/biome/foundation/vue.jsonc',
            'typescript/biome/foundation/svelte.jsonc',
            'typescript/biome/foundation/solid.jsonc',
          ]),
        },
        release: {
          ...RELEASE,
          'presets/typescript/biome/foundation/solid.jsonc': '{}\n',
          'presets/typescript/biome/foundation/svelte.jsonc': '{}\n',
          'presets/typescript/biome/foundation/vue.jsonc': '{}\n',
        },
      },
      warnings: [
        {
          code: WarningCode.Wiring,
          message:
            'biome.json lacks common/foundation/self, typescript/foundation/self, typescript/foundation/core and 1 more; names typescript/foundation/react-dom, typescript/foundation/vue, typescript/foundation/svelte and 1 more, which it does not take — run /constitution:ratify',
        },
      ],
    },
    {
      condition: 'a marker says more than its path, a chain runs out of order and a copy is edited',
      fixture: {
        project: pyprojectOf({
          linter: IMPORT_LINTER_COPY.replace(
            `# from ${IMPORT_LINTER}`,
            `# from ${IMPORT_LINTER} by hand`,
          ),
          ruff: ruffConfig(
            [
              'core',
              'self',
            ],
            'self',
          ),
          vulture: vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 80\n'),
        }),
      },
      warnings: [
        {
          code: WarningCode.Wiring,
          message:
            "pyproject.toml a marker of import-linter says more than its path; its marker of ruff lists the links out of order; it extends a link of ruff short of the chain's end; the copy of python/foundation/core is edited inside — run /constitution:ratify",
        },
      ],
    },
    {
      condition: 'several tools lack parts and copies have no end or no part',
      fixture: {
        project: pyprojectOf({
          linter: `# from ${IMPORT_LINTER}\n[[tool.importlinter.contracts]]\nname = "no-cycle"\nancestors = ["shop"]\n`,
          ruff: ruffConfig(
            [
              'self',
            ],
            'self',
          ),
          vulture: `# from ${part('python/vulture/foundation/gone.toml')}\n[tool.vulture]\n# end ${part('python/vulture/foundation/gone.toml')}\n# from ${part('python/vulture/foundation/django.toml')}\n[tool.vulture]\n# end ${part('python/vulture/foundation/django.toml')}\n`,
        }),
        release: {
          ...RELEASE,
          'presets/python/vulture/foundation/django.toml': '[tool.vulture]\n',
        },
      },
      warnings: [
        {
          code: WarningCode.Wiring,
          message:
            "pyproject.toml lacks ruff:python/foundation/core, vulture:python/foundation/core; the copy of python/foundation/core has no end line; it extends a link of ruff short of the chain's end; holds a copy of python/foundation/gone the release no longer has; copies python/foundation/django, which it does not take — run /constitution:ratify",
        },
      ],
    },
  ])('should word each warning as its format pins when $condition', ({ fixture, warnings }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const found = checkWiring(input);

    // Assert
    expect(found).toStrictEqual(warnings);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: 'each file takes the parts of its blocks',
      fixture: {},
      warned: [],
    },
    {
      condition: 'a file names a part of a block no unit takes',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: 'a file names a part of a block another unit takes, which keeps a file of its own',
      fixture: {
        blocks: WITH_REACT_DOM,
        project: {
          ...WIRED,
          'apps/web/biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
        units: WEB_UNITS,
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: 'a file lacks the part named after its language',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/typescript',
        ],
      ],
    },
    {
      condition:
        'a file names a part named after the common scope, which a block is named after too',
      fixture: {
        blocks: [
          ...BLOCKS,
          implementationOf('common'),
        ],
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'common/biome/foundation/common.jsonc',
          ]),
        },
        release: {
          ...RELEASE,
          'presets/common/biome/foundation/common.jsonc': '{}\n',
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'common/foundation/common',
        ],
      ],
    },
    {
      condition: 'the repository takes core without listing it',
      fixture: {
        units: [
          {
            blocks: IDS.filter((id) => id !== 'core'),
          },
        ],
      },
      warned: [],
    },
    {
      condition: "the repository takes no language of a tool's parts",
      fixture: {
        units: [
          {
            blocks: IDS.filter((id) => id !== 'python'),
          },
        ],
      },
      warned: [],
    },
    {
      condition: "a tool is wired at the first of its templates' paths",
      fixture: {
        project: {
          ...WIRED,
          'osv-scanner.toml': `licenses = "${part('common/osv-scanner/foundation/gone.txt')}"\n`,
        },
        release: {
          ...RELEASE,
          'templates/project/common/osv-scanner/osv-scanner.toml': 'licenses = "<parts>"\n',
        },
      },
      warned: [],
    },
    {
      condition: 'a template of a tool that takes no part writes the file',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
        },
        release: {
          ...RELEASE,
          'templates/project/typescript/typescript/biome.json': '{}\n',
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/typescript',
        ],
      ],
    },
    {
      condition: 'a copied part extends a part of a block no unit takes',
      fixture: {
        blocks: [
          ...BLOCKS,
          implementationOf('django'),
        ],
        project: pyprojectOf({
          vulture: vultureCopy('[tool.vulture]\nextend = "django.toml"\n'),
        }),
        release: {
          ...RELEASE,
          'presets/python/vulture/foundation/core.toml': '[tool.vulture]\nextend = "django.toml"\n',
          'presets/python/vulture/foundation/django.toml': 'min_confidence = 80\n',
        },
        units: [
          {
            blocks: IDS,
          },
        ],
      },
      warned: [],
    },
    {
      condition: 'a part of a block no unit takes links to another',
      fixture: {
        blocks: CHAINED,
        units: [
          {
            blocks: IDS,
          },
        ],
      },
      warned: [],
    },
    {
      condition: 'a chained part links to a part its tool does not have',
      fixture: {
        blocks: [
          ...BLOCKS,
          implementationOf('mypy'),
        ],
        project: pyprojectOf({
          linter: `${IMPORT_LINTER_COPY}# from ${part('python/mypy/foundation/python.toml')}\n[tool.mypy]\nextend = "${part('python/mypy/foundation/python.toml')}"\n`,
        }),
        release: {
          ...RELEASE,
          'presets/python/mypy/foundation/python.toml': 'extend = "core.toml"\n',
          'templates/project/python/mypy/pyproject.toml':
            '# from <parts>\n[tool.mypy]\nextend = "<chain end>"\n',
        },
      },
      warned: [],
    },
    {
      condition: "a tool's template of a language writes another file",
      fixture: {
        project: {
          ...WIRED,
          'osv-scanner.toml': `licenses = "${part('typescript/osv-scanner/foundation/core.txt')}"\n`,
        },
        release: {
          ...RELEASE,
          'presets/typescript/osv-scanner/foundation/core.txt': 'MIT\n',
          'templates/project/typescript/osv-scanner/osv-scanner.toml': 'licenses = "<parts>"\n',
        },
      },
      warned: [],
    },
    {
      condition: 'the presets hold a scope named after a block that is no language',
      fixture: {
        release: {
          ...RELEASE,
          'presets/workspace/biome/foundation/self.jsonc': '{}\n',
          'templates/project/workspace/biome/biome.json': '{ "extends": ["<parts>"] }\n',
        },
      },
      warned: [],
    },
    {
      condition: "the root of a workspace follows no axis of its tool's workspace part",
      fixture: {
        blocks: [
          ...BLOCKS,
          implementationOf('knip'),
        ],
        release: {
          ...RELEASE,
          'presets/typescript/knip/architecture/workspace.json': '{}\n',
          'presets/typescript/knip/foundation/core.json': '{}\n',
          'templates/project/typescript/knip/knip.json': '{ "extends": ["<parts>"] }\n',
        },
        units: [
          {
            axes: [
              Axis.Foundation,
            ],
          },
        ],
      },
      warned: [
        [
          'wiring',
          'knip',
          '.',
        ],
        [
          'wiring',
          '.dependency-cruiser.mjs',
          'names',
          'typescript/architecture/workspace',
        ],
      ],
    },
    {
      condition: 'the repository follows foundation alone',
      fixture: {
        units: [
          {
            axes: [
              Axis.Foundation,
            ],
          },
        ],
      },
      warned: [
        [
          'wiring',
          '.dependency-cruiser.mjs',
          'names',
          'typescript/architecture/workspace',
        ],
      ],
    },
    {
      condition: "the root of a workspace takes a part of its packages' own",
      fixture: {
        project: {
          ...WIRED,
          '.dependency-cruiser.mjs': PACKAGE_CRUISER,
        },
      },
      warned: [
        [
          'wiring',
          '.dependency-cruiser.mjs',
          'names',
          'typescript/architecture/core',
        ],
      ],
    },
    {
      condition: 'the repository is no workspace',
      fixture: {
        units: [
          {
            blocks: IDS.filter((id) => id !== 'workspace'),
          },
        ],
      },
      warned: [
        [
          'wiring',
          '.dependency-cruiser.mjs',
          'lacks',
          'typescript/architecture/core',
          'names',
          'typescript/architecture/workspace',
        ],
      ],
    },
    {
      condition: 'a folder below the root of a workspace takes its own parts',
      fixture: {
        project: {
          ...WIRED,
          'tools/lint/.dependency-cruiser.mjs': PACKAGE_CRUISER,
        },
        tracked: [
          'tools/lint/.dependency-cruiser.mjs',
        ],
      },
      warned: [
        [
          'unlisted',
          'tools/lint',
          '.dependency-cruiser.mjs',
          'constitution.yaml',
        ],
      ],
    },
  ])('should hold each file to the parts its units take when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: 'it names only the parts of its blocks',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            'common/biome/foundation/self.jsonc',
            REACT_DOM,
            'typescript/biome/foundation/vue.jsonc',
          ]),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/self',
          'typescript/foundation/core',
          'typescript/foundation/typescript',
        ],
      ],
    },
    {
      condition: 'it names only its own parts',
      fixture: {
        project: WIRED,
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/vue',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "it names only its language's parts",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS.slice(1),
            REACT_DOM,
            'typescript/biome/foundation/vue.jsonc',
          ]),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'common/foundation/self',
        ],
      ],
    },
  ])(
    'should list what a file lacks in the order its parts are taken when $condition',
    ({ fixture, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: [
          ...BLOCKS,
          implementationOf('vue'),
          implementationOf('react-dom'),
        ],
        release: {
          ...RELEASE,
          'presets/typescript/biome/foundation/vue.jsonc': '{}\n',
        },
        ...fixture,
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnedOf(warnings)).toStrictEqual(warned);
    },
  );

  it('should list what a file lacks axis by axis when a tool has parts on each', () => {
    // Arrange
    const input = wiringOf({
      project: {
        'biome.json': biomeJson([
          REACT_DOM,
        ]),
      },
      release: {
        ...RELEASE,
        'presets/common/biome/architecture/core.jsonc': '{}\n',
        'presets/common/biome/workflow/self.jsonc': '{}\n',
      },
      units: [
        {
          blocks: [
            'biome',
          ],
        },
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual([
      [
        'wiring',
        'biome.json',
        'lacks',
        'common/foundation/self',
        'common/architecture/core',
        'common/workflow/self',
        'names',
        'typescript/foundation/react-dom',
      ],
    ]);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: "a unit's own file lacks the part of a block it adds",
      fixture: {
        blocks: WITH_REACT_DOM,
        project: {
          ...WIRED,
          'apps/web/biome.json': biomeJson(BIOME_PARTS),
        },
        units: WEB_UNITS,
      },
      warned: [
        [
          'wiring',
          'apps/web/biome.json',
          'lacks',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "the root's file serves a unit that keeps none",
      fixture: {
        blocks: WITH_REACT_DOM,
        units: WEB_UNITS,
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "a unit's overrides lower the rule the root's file would hold it to",
      fixture: {
        blocks: WITH_REACT_DOM,
        units: [
          {
            blocks: IDS,
          },
          {
            blocks: [
              ...IDS,
              'react-dom',
            ],
            lowered: [
              RULE,
            ],
            path: 'apps/web',
          },
        ],
      },
      warned: [],
    },
    {
      condition: "the repository's overrides lower the rule",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': '{}\n',
        },
        units: [
          {
            lowered: [
              RULE,
            ],
          },
        ],
      },
      warned: [],
    },
    {
      condition: "the repository's overrides lower the rule and a package's tool is wired nowhere",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': '{}\n',
        },
        units: [
          {
            lowered: [
              RULE,
            ],
          },
          {
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        [
          'wiring',
          'biome',
          'packages/kit',
        ],
      ],
    },
    {
      condition: "the repository's tool is wired in a folder of its own below it",
      fixture: {
        project: {
          ...UNBIOMED,
          'tools/lint/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'tools/lint/biome.json',
        ],
        units: [
          {},
          {
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        [
          'unlisted',
          'tools/lint',
          'biome.json',
          'constitution.yaml',
        ],
      ],
    },
    {
      condition: "a package's marker alone wires the repository's tool",
      fixture: {
        project: {
          'packages/kit/pyproject.toml': VULTURE_COPY,
        },
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
              'vulture',
            ],
            path: 'packages/kit',
          },
        ],
      },
      warned: [],
    },
    {
      condition: 'no file names the parts of a tool the repository takes beside others',
      fixture: {
        project: pyprojectOf({
          vulture: '',
        }),
      },
      warned: [
        [
          'wiring',
          'vulture',
          '.',
        ],
      ],
    },
    {
      condition: "the repository's tool is wired by a package's own file alone",
      fixture: {
        project: {
          ...UNBIOMED,
          'packages/kit/biome.json': biomeJson(BIOME_PARTS),
        },
        units: [
          {},
          {
            path: 'packages/kit',
          },
        ],
      },
      warned: [],
    },
    {
      condition: "a package's tool is wired only by a unit nested in it",
      fixture: {
        project: {
          ...UNBIOMED,
          'packages/kit/inner/biome.json': biomeJson(BIOME_PARTS),
        },
        units: [
          {
            blocks: IDS.filter((id) => id !== 'biome'),
          },
          {
            path: 'packages/kit',
          },
          {
            path: 'packages/kit/inner',
          },
        ],
      },
      warned: [
        [
          'wiring',
          'biome',
          'packages/kit',
        ],
      ],
    },
    {
      condition: "a package's tool is wired only in a folder beside it",
      fixture: {
        project: {
          ...UNBIOMED,
          'packages/kitten/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'packages/kitten/biome.json',
        ],
        units: [
          {
            blocks: IDS.filter((id) => id !== 'biome'),
          },
          {
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        [
          'wiring',
          'biome',
          'packages/kit',
        ],
        [
          'unlisted',
          'packages/kitten',
          'biome.json',
          'constitution.yaml',
        ],
        [
          'wiring',
          'packages/kitten/biome.json',
          'names',
          'common/foundation/self',
          'typescript/foundation/self',
          'typescript/foundation/core',
          '1',
        ],
      ],
    },
    {
      condition: "a package's tool is wired in a folder of its own below it",
      fixture: {
        blocks: WITH_REACT_DOM,
        project: {
          ...UNBIOMED,
          'packages/kit/config/biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
        tracked: [
          'packages/kit/config/biome.json',
        ],
        units: [
          {
            blocks: IDS.filter((id) => id !== 'biome'),
          },
          {
            blocks: [
              ...IDS,
              'react-dom',
            ],
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        [
          'unlisted',
          'packages/kit/config',
          'biome.json',
          'constitution.yaml',
        ],
      ],
    },
  ])('should hold each file to the units it serves when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: 'a hidden folder keeps it',
      fixture: {
        project: {
          ...WIRED,
          '.cache/biome.json': biomeJson([
            REACT_DOM,
          ]),
        },
        tracked: [
          '.cache/biome.json',
        ],
      },
      warned: [],
    },
    {
      condition: 'a folder below a hidden one keeps it',
      fixture: {
        project: {
          ...WIRED,
          'tools/.cache/biome.json': biomeJson([
            REACT_DOM,
          ]),
        },
        tracked: [
          'tools/.cache/biome.json',
        ],
      },
      warned: [],
    },
    {
      condition: 'a copy of a template keeps it',
      fixture: {
        project: {
          ...WIRED,
          'vendor/templates/project/common/biome/biome.json': biomeJson([
            REACT_DOM,
          ]),
        },
        tracked: [
          'vendor/templates/project/common/biome/biome.json',
        ],
      },
      warned: [],
    },
    {
      condition: 'a folder named with a dot keeps it',
      fixture: {
        project: {
          ...WIRED,
          'v1.2/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'v1.2/biome.json',
        ],
      },
      warned: [
        [
          'unlisted',
          'v1.2',
          'biome.json',
          'constitution.yaml',
        ],
      ],
    },
    {
      condition: 'a folder no unit names keeps one that names no part',
      fixture: {
        project: {
          ...WIRED,
          'tools/lint/biome.json': '{}\n',
        },
        tracked: [
          'tools/lint/biome.json',
        ],
      },
      warned: [],
    },
    {
      condition: "git lists the repository's own before a folder's",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
          'tools/lint/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'biome.json',
          'tools/lint/biome.json',
        ],
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/typescript',
        ],
        [
          'unlisted',
          'tools/lint',
          'biome.json',
          'constitution.yaml',
        ],
      ],
    },
    {
      condition: 'git does not track it',
      fixture: {
        project: {
          ...WIRED,
          'tools/lint/biome.json': biomeJson([
            REACT_DOM,
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'one folder keeps two',
      fixture: {
        project: {
          ...WIRED,
          'tools/lint/.dependency-cruiser.mjs': PACKAGE_CRUISER,
          'tools/lint/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'tools/lint/biome.json',
          'tools/lint/.dependency-cruiser.mjs',
        ],
      },
      warned: [
        [
          'unlisted',
          'tools/lint',
          '.dependency-cruiser.mjs',
          'constitution.yaml',
        ],
      ],
    },
    {
      condition: "the repository's own cannot be read",
      fixture: {
        unreadable: [
          'biome.json',
        ],
      },
      warned: [
        [
          'wiring',
          'biome',
          '.',
        ],
      ],
    },
    {
      condition: "a template's path runs through folders",
      fixture: {
        blocks: [
          ...BLOCKS,
          implementationOf('github'),
        ],
        project: {
          ...WIRED,
          '.github/workflows/ci.yml': `uses: ${part('common/github/workflow/core.yml')}\n`,
          'docs/ci.yml': `uses: ${part('common/github/workflow/gone.yml')}\n`,
          'tools/lint/.github/workflows/ci.yml': `uses: ${part('common/github/workflow/core.yml')}\n`,
        },
        release: {
          ...RELEASE,
          'presets/common/github/workflow/core.yml': 'on: push\n',
          'templates/project/common/github/.github/workflows/ci.yml': 'uses: <parts>\n',
        },
        tracked: [
          'docs/ci.yml',
          'tools/lint/.github/workflows/ci.yml',
          '.github/workflows/ci.yml',
        ],
      },
      warned: [
        [
          'unlisted',
          'tools/lint',
          '.github/workflows/ci.yml',
          'constitution.yaml',
        ],
      ],
    },
  ])("should check a file at a template's path when $condition", ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: 'a comment names a part it does not take',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}// ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment opens with a hash',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}# ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment opens a block',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}/* ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment goes on in a block',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)} \t* ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'code follows a comment on its line',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"a": 1 // ${part(REACT_DOM)}\n`,
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "a path of the project's own holds the part's",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"plugins": ["tools/presets/${REACT_DOM}"]\n`,
        },
      },
      warned: [],
    },
    {
      condition: "a path of the project's own holds the part's and the project lists a pack",
      fixture: {
        items: [
          packOf('packs/acme'),
        ],
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"plugins": ["tools/presets/${REACT_DOM}"]\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: "a line names a part by the project's path, then by the release's",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"plugins": ["tools/presets/typescript/biome/foundation/vue.jsonc", "${part(REACT_DOM)}"]\n`,
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: 'it names a part twice',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
            REACT_DOM,
          ]),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: 'a part has no extension',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation/react-dom',
          ]),
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "a line ends with a part's name",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}${part('typescript/biome/foundation/react-dom')}\n`,
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      condition: "it names the tool's bindings",
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation/bindings.yaml',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'it names a file in a folder of an axis',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation/plugins/no-enum.grit',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'it names the folder of an axis',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part without a name',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation/.jsonc',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'it names a scope the tool has no part in',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'python/biome/foundation/core.jsonc',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by the path of a pack the project lists from its folder',
      fixture: {
        items: [
          packOf('./packs/acme'),
        ],
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'names',
          'typescript/foundation/acme',
        ],
      ],
    },
    {
      condition: 'it names a part by the path of a pack the project does not list',
      fixture: {
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by the path of a pack only a package lists',
      fixture: {
        items: [
          {
            app: 'apps/web',
            key: 'packs',
            text: 'packs/acme',
          },
        ],
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by a path the project lists as other than a pack',
      fixture: {
        items: [
          {
            app: '',
            key: 'implementations',
            text: 'packs/acme',
          },
        ],
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by the path of a pack that holds no part',
      fixture: {
        items: [
          packOf('packs/empty'),
        ],
        project: {
          ...WIRED,
          'biome.json': `${biomeJson(BIOME_PARTS)}"empty": "packs/empty/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/empty/README.md': '# Empty\n',
        },
      },
      warned: [],
    },
  ])('should read the parts a file names when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    copy: string;
    original: string;
    warned: string[][];
  }>([
    {
      condition: 'the copy fills the package',
      copy: 'ancestors = ["shop"]\n',
      warned: [],
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the package is one character long',
      copy: 'ancestors = ["s"]\n',
      warned: [],
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy leaves the package empty',
      copy: 'ancestors = [""]\n',
      warned: EDITED,
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy changes the text before the package',
      copy: 'ancestor = ["shop"]\n',
      warned: EDITED,
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy changes the text after the package',
      copy: 'ancestors = ["shop"],\n',
      warned: EDITED,
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy fills two packages',
      copy: 'layers = ["shop.a", "shop.b"]\n',
      warned: [],
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'the copy leaves the first of two packages empty',
      copy: 'layers = [".a", "shop.b"]\n',
      warned: EDITED,
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'the copy leaves the second of two packages empty',
      copy: 'layers = ["s.a", ".b"]\n',
      warned: EDITED,
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'the copy loses the text between two packages',
      copy: 'layers = ["shop.a" "shop.b"]\n',
      warned: EDITED,
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'two packages sit side by side',
      copy: 'name = "shop"\n',
      warned: EDITED,
      original: 'name = "<package><package>"\n',
    },
    {
      condition: 'the copy keeps a line without a package',
      copy: 'min = 60\n',
      warned: [],
      original: 'min = 60\n',
    },
    {
      condition: 'the copy changes a line without a package',
      copy: 'min = 80\n',
      warned: EDITED,
      original: 'min = 60\n',
    },
    {
      condition: 'the copy holds a line more',
      copy: 'min = 60\nmax = 90\n',
      warned: EDITED,
      original: 'min = 60\n',
    },
    {
      condition: 'the copy and the part leave out blank lines elsewhere',
      copy: '\nmin = 60\nmax = 90\n \t\n',
      warned: [],
      original: 'min = 60\n\t\nmax = 90\n',
    },
    {
      condition: 'the part ends its lines with carriage returns',
      copy: 'min = 60\nmax = 90\n',
      warned: [],
      original: 'min = 60\r\nmax = 90\r\n',
    },
  ])("should hold a copy to its part's lines when $condition", ({ copy, original, warned }) => {
    // Arrange
    const input = wiringOf({
      project: pyprojectOf({
        linter: `# from ${IMPORT_LINTER}\n${copy}# end ${IMPORT_LINTER}\n`,
      }),
      release: {
        ...RELEASE,
        'presets/python/import-linter/foundation/core.toml': original,
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    vulture: string;
    warned: string[][];
  }>([
    {
      condition: "it names a path of the project's own",
      vulture: `${VULTURE_COPY}# from tools/presets/python/vulture/foundation/old.toml\n`,
      warned: [],
    },
    {
      condition: 'it names the folder of an axis',
      vulture: `${VULTURE_COPY}# from ${part('python/vulture/foundation')}\n`,
      warned: [],
    },
    {
      condition: 'it names a part of another tool',
      vulture: `${VULTURE_COPY}# from ${part('python/osv-scanner/foundation/core.toml')}\n`,
      warned: [],
    },
    {
      condition: 'it names a file in a folder of an axis',
      vulture: `${VULTURE_COPY}# from ${part('python/vulture/foundation/sub/core.toml')}\n`,
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/sub',
        ],
      ],
    },
    {
      condition: 'it lists a second path after a comma',
      vulture: VULTURE_COPY.replace(
        `# from ${VULTURE}`,
        `# from ${VULTURE},${part('python/vulture/foundation/django.toml')}`,
      ),
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'vulture',
        ],
      ],
    },
    {
      condition: 'it opens with no blank after the hash',
      vulture: vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 80\n').replace(
        '# from',
        '#from',
      ),
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      condition: 'it is indented',
      vulture: vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 80\n').replace(
        '# from',
        ' \t# \tfrom',
      ),
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      condition: 'it follows code on its line',
      vulture: `min_confidence = 80 # from ${VULTURE}\n`,
      warned: [],
    },
    {
      condition: 'its end names another part',
      vulture: VULTURE_COPY.replace(`# end ${VULTURE}`, `# end ${IMPORT_LINTER}`),
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      condition: 'its end comes before it',
      vulture: `# end ${VULTURE}\n${VULTURE_COPY.replace(`# end ${VULTURE}`, '')}`,
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      condition: 'its end is indented with no blank after the hash',
      vulture: VULTURE_COPY.replace(`# end ${VULTURE}`, ` \t#end ${VULTURE}`),
      warned: [],
    },
    {
      condition: 'its end follows code on its line',
      vulture: VULTURE_COPY.replace(`# end ${VULTURE}`, `min_confidence = 60 # end ${VULTURE}`),
      warned: EDITED,
    },
    {
      condition: 'it ends with blanks',
      vulture: VULTURE_COPY.replace(`# from ${VULTURE}`, `# from ${VULTURE} \t `),
      warned: [],
    },
    {
      condition: 'its end is no comment',
      vulture: VULTURE_COPY.replace(`# end ${VULTURE}`, `end ${VULTURE}`),
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
  ])("should read a copy's marker when $condition", ({ vulture, warned }) => {
    // Arrange
    const input = wiringOf({
      project: pyprojectOf({
        vulture,
      }),
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    links: string[];
    warned: string[][];
  }>([
    {
      links: [
        'self',
        'core',
        'pytest',
        'fastapi',
      ],
      warned: [],
    },
    {
      links: [
        'self',
        'core',
        'fastapi',
      ],
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      links: [
        'core',
        'self',
        'pytest',
        'fastapi',
      ],
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
  ])(
    "should hold a chain's marker to every link in order when it names $links",
    ({ links, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: CHAINED,
        project: pyprojectOf({
          ruff: ruffConfig(links, 'fastapi'),
        }),
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnedOf(warnings)).toStrictEqual(warned);
    },
  );

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: string[][];
  }>([
    {
      condition: 'a comment extends a link short of the end',
      fixture: {
        project: pyprojectOf({
          ruff: `${RUFF}# extend = "${part('python/ruff/foundation/self.toml')}"\n`,
        }),
      },
      warned: [],
    },
    {
      condition: 'it extends a link short of the end with no blank around the sign',
      fixture: {
        project: pyprojectOf({
          ruff: `${RUFF}extend="${part('python/ruff/foundation/self.toml')}"\n`,
        }),
      },
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
    {
      condition: 'its marker leaves out the end',
      fixture: {
        project: pyprojectOf({
          ruff: ruffConfig(
            [
              'self',
            ],
            'core',
          ),
        }),
      },
      warned: [],
    },
    {
      condition: 'it extends a part of another scope',
      fixture: {
        project: pyprojectOf({
          ruff: `${RUFF}extend = "${part('typescript/ruff/foundation/self.toml')}"\n`,
        }),
        release: {
          ...RELEASE,
          'presets/typescript/ruff/foundation/self.toml': 'line-length = 100\n',
        },
      },
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'names',
          'ruff:typescript/foundation/self',
        ],
      ],
    },
    {
      condition: 'its links run in a ring',
      fixture: {
        project: pyprojectOf({
          ruff: ruffConfig(
            [
              'core',
              'self',
            ],
            'self',
          ),
        }),
        release: {
          ...RELEASE,
          'presets/python/ruff/foundation/self.toml': 'extend = "core.toml"\n',
        },
      },
      warned: [],
    },
    {
      condition: 'a ring hangs from its end',
      fixture: {
        blocks: CHAINED,
        project: pyprojectOf({
          ruff: ruffConfig(
            [
              'self',
              'core',
              'fastapi',
            ],
            'fastapi',
          ),
        }),
        release: {
          ...RELEASE,
          'presets/python/ruff/foundation/fastapi.toml': 'extend = "core.toml"\n',
          'presets/python/ruff/foundation/self.toml': 'extend = "core.toml"\n',
        },
        units: [
          {
            blocks: [
              ...IDS,
              'fastapi',
            ],
          },
        ],
      },
      warned: [],
    },
  ])("should hold a file to its chain's end when $condition", ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    line: string;
    warned: string[][];
  }>([
    {
      condition: 'it extends a part by its file',
      line: 'extend = "pytest.toml"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      condition: 'it extends a part with no blank around the sign',
      line: 'extends="pytest.toml"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      condition: 'it extends a part with tabs around the sign',
      line: 'extend\t=\t"pytest.toml"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      condition: 'it extends a part in a folder, with a comment after it',
      line: 'line-length = 100\nextend = "../shared/pytest.toml" # the tests\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      condition: 'it extends a part by its name alone',
      line: 'extend = "pytest"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'lacks',
          'ruff:python/foundation/pytest',
          'ruff',
        ],
      ],
    },
    {
      condition: 'the line is indented',
      line: ' extend = "pytest.toml"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
    {
      condition: 'the line quotes no path',
      line: 'extend = pytest.toml\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
    {
      condition: 'it extends a block that has no part',
      line: 'extend = "django.toml"\n',
      warned: [
        [
          'wiring',
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
  ])('should take the link a chained part extends when $condition', ({ line, warned }) => {
    // Arrange
    const input = wiringOf({
      blocks: [
        ...CHAINED,
        implementationOf('django'),
      ],
      project: pyprojectOf({
        ruff: ruffConfig(
          [
            'self',
            'core',
            'fastapi',
          ],
          'fastapi',
        ),
      }),
      release: {
        ...RELEASE,
        'presets/python/ruff/foundation/bindings.yaml': 'core: {}\n',
        'presets/python/ruff/foundation/fastapi.toml': line,
      },
      units: [
        {
          blocks: [
            ...IDS,
            'fastapi',
          ],
        },
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it('should hold an empty copy to its part when the part cannot be read', () => {
    // Arrange
    const input = wiringOf({
      project: pyprojectOf({
        linter: `# from ${IMPORT_LINTER}\n# end ${IMPORT_LINTER}\n`,
      }),
      unreadable: [
        '.droneey/constitution/presets/python/import-linter/foundation/core.toml',
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    files: Files;
    warned: string[][];
  }>([
    {
      condition: "each file takes the pack's parts by its path",
      files: {
        'acme.toml': `extends = "${ACME_SELF}"\n`,
        'biome.json': ACME_BIOME,
      },
      warned: [],
    },
    {
      condition: "Biome's file lacks the pack's part for its block",
      files: {
        'acme.toml': `extends = "${ACME_SELF}"\n`,
      },
      warned: [
        [
          'wiring',
          'biome.json',
          'lacks',
          'typescript/foundation/acme',
        ],
      ],
    },
    {
      condition: "the pack's own tool takes none of its parts",
      files: {
        'acme.toml': 'strict = true\n',
        'biome.json': ACME_BIOME,
      },
      warned: [
        [
          'wiring',
          'acme',
          '.',
        ],
      ],
    },
  ])("should wire a pack's parts and templates when $condition", ({ files, warned }) => {
    // Arrange
    const input = wiringOf({
      blocks: [
        ...BLOCKS,
        implementationOf('acme'),
      ],
      items: [
        packOf('packs/acme'),
      ],
      project: {
        ...WIRED,
        ...PACK_FILES,
        ...files,
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual(warned);
  });

  it('should read a file whose lines end with carriage returns when its copies hold', () => {
    // Arrange
    const input = wiringOf({
      project: {
        ...WIRED,
        'pyproject.toml': PYPROJECT.replaceAll('\n', '\r\n'),
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnedOf(warnings)).toStrictEqual([]);
  });
});

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
};
const PLAN_BLOCKS = [
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
const PLAN_PARTS = [
  'common/biome/foundation/self.jsonc',
  'typescript/biome/foundation/self.jsonc',
  'typescript/biome/foundation/core.jsonc',
];
const PLAN_IDS = [
  'core',
  'typescript',
  'biome',
];
const PLAN_FILES: Files = {
  '.biomeignore': 'dist\n',
  'biome.json': biomeJson(PLAN_PARTS),
};

describe('planWiring', () => {
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
        'biome.json (new) for ., packages/kit',
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
    const planned = planWiring(input);

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
      ],
    },
    {
      condition: 'a package keeps a file of a tool with a workspace part',
      fixture: {
        project: {
          '.dependency-cruiser.mjs': ROOT_CRUISER,
          'packages/kit/.dependency-cruiser.mjs': PACKAGE_CRUISER,
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
        items: [
          packOf('./packs/acme'),
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
          './packs/acme/presets/common/acme/foundation/self.toml',
        ],
      ],
    },
  ])("should list the files of the release's tools when $condition", ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const lines = planWiring(input);

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
          'biome.json': biomeJson(PLAN_PARTS),
        },
        units: [
          {
            blocks: PLAN_IDS,
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
            blocks: PLAN_IDS,
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
        project: PLAN_FILES,
        units: [
          {
            blocks: PLAN_IDS,
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
      condition: 'a block is named self',
      fixture: {
        blocks: [
          ...PLAN_BLOCKS,
          implementationOf('self'),
        ],
        project: PLAN_FILES,
        units: [
          {
            blocks: [
              ...PLAN_IDS,
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
        project: PLAN_FILES,
        release: {
          ...PLAN_RELEASE,
          'templates/project/common/react-dom': 'react\n',
        },
        units: [
          {
            blocks: [
              ...PLAN_IDS,
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
            blocks: PLAN_IDS,
          },
          {
            blocks: PLAN_IDS,
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
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
          'biome.json': biomeJson(PLAN_PARTS),
          'packages/kit/biome.json': '{ "root": false }\n',
        },
        units: [
          {
            blocks: PLAN_IDS,
          },
          {
            blocks: PLAN_IDS,
            path: 'packages/kit',
          },
        ],
      },
      planned: [
        [
          '.biomeignore',
          'new',
          '.',
          'packages/kit',
        ],
        [
          'biome',
          template('typescript/biome/.biomeignore'),
        ],
        [
          'biome.json',
          '.',
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
            ...PLAN_PARTS,
            'typescript/biome/foundation/react-dom.jsonc',
          ]),
          'biome.json': biomeJson(PLAN_PARTS),
        },
        units: [
          {
            blocks: PLAN_IDS,
          },
          {
            blocks: [
              ...PLAN_IDS,
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
            blocks: PLAN_IDS,
          },
          {
            blocks: PLAN_IDS,
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
          '.',
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
          'a/biome.json',
          '.',
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
  ])('should list each file with the units it serves when $condition', ({ fixture, planned }) => {
    // Arrange
    const input = wiringOf({
      blocks: PLAN_BLOCKS,
      release: PLAN_RELEASE,
      ...fixture,
    });

    // Act
    const lines = planWiring(input);

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
        blocks: PLAN_BLOCKS,
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
      const lines = planWiring(input);

      // Assert
      expect(plannedOf(lines)).toStrictEqual(planned);
    },
  );
});
