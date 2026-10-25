import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { ProjectWarning, WarningCode, WiringProblemKind } from '#/kernel/entities';

import type { Files, WiringFixture } from '../../../../../__tests__/wiring.fixtures';
import {
  ACME_SELF,
  BIOME_PARTS,
  BLOCKS,
  biomeJson,
  fileMiswired,
  folderKeepsConfig,
  HOOKS_RELEASE,
  hooksBlocks,
  hooksMember,
  hooksOf,
  hooksOwnUnits,
  hooksRootBlocks,
  hooksUnits,
  implementationOf,
  importLinter,
  importLinterCopy,
  memberNotSkipped,
  PACK_FILES,
  packageCruiser,
  packFilesIn,
  part,
  pyproject,
  REACT_DOM,
  RELEASE,
  RULE,
  releaseLinkLoops,
  ruffConfig,
  ruffSection,
  skipOfNoMember,
  toolWiredNowhere,
  UNBIOMED,
  vultureCopy,
  vulturePart,
  vultureSection,
  wired,
  wiringFileUnreadable,
  wiringOf,
} from '../../../../../__tests__/wiring.fixtures';
import { checkWiring } from '../check-wiring.use-case';

const ids: readonly string[] = BLOCKS.map((block) => block.id);

// A member that runs Biome and no other tool of the repository's.
const BIOME_IDS: readonly string[] = [
  'core',
  'typescript',
  'biome',
] as const;

const withReactDom = [
  ...BLOCKS,
  implementationOf('react-dom'),
];

const webUnits = [
  {
    blocks: ids,
  },
  {
    blocks: [
      ...BIOME_IDS,
      'react-dom',
    ],
    path: 'apps/web',
  },
];

const chained = [
  ...BLOCKS,
  implementationOf('pytest'),
  implementationOf('fastapi'),
];

const acmeBiome = `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`;

// A member's Biome and acme, each naming the pack's parts by the path given.
const memberAcmeFiles = (pack: string): Files => ({
  'apps/web/acme.toml': `extends = "${pack}/presets/common/acme/foundation/self.toml"\n`,
  'apps/web/biome.json': `${biomeJson(BIOME_PARTS)}"acme": "${pack}/presets/typescript/biome/foundation/acme.jsonc"\n`,
});

const pyprojectOf = (input: { linter?: string; ruff?: string; vulture?: string }): Files => ({
  ...wired,
  'pyproject.toml': `${input.ruff ?? ruffSection}\n${input.vulture ?? vultureSection}\n${input.linter ?? importLinterCopy}`,
});

// Each tool of the units wired but the hooks.
const hooksWired: Files = {
  'apps/web/pyproject.toml': ruffSection,
  'biome.json': biomeJson(BIOME_PARTS),
  'packages/check/pyproject.toml': ruffSection,
};

// Biome's root file with its parts, skipping the folders given as its template writes them.
const skippingBiomeOf = (folders: readonly string[]): string =>
  `${biomeJson(BIOME_PARTS).slice(0, -3)},\n  "files": {\n    "includes": [\n${folders.map((folder) => `    "!!${folder}"`).join(',\n')}\n    ]\n  }\n}\n`;

// Two members that follow no tool, each in a folder of the workspace.
const skippedMembers = [
  {
    blocks: [
      'core',
    ],
    path: 'apps/web',
  },
  {
    blocks: [
      'core',
    ],
    path: 'packages/kit',
  },
];

// A root's job of lefthook for a tool, skipping the folders given.
interface Job {
  readonly exclude: readonly string[];
  readonly name: string;
}

const jobLines = (job: Job): string =>
  `    - name: ${job.name}\n      exclude:\n${job.exclude.map((folder) => `        - "${folder}"\n`).join('')}`;

const lefthookOf = (jobs: readonly Job[]): string =>
  `pre-commit:\n  jobs:\n${jobs.map(jobLines).join('')}`;

const memberFolders = [
  'apps/**',
  'packages/**',
];

// The root's job of shellcheck and of shfmt, each skipping the members' folders.
const SKIPPING_JOBS: readonly Job[] = [
  {
    exclude: memberFolders,
    name: 'shellcheck',
  },
  {
    exclude: memberFolders,
    name: 'shfmt',
  },
] as const;

// A template of the root's job of a tool that skips the members' folders, as shellcheck's and shfmt's
// give lefthook.yaml.
const skipJobOf = (tool: string): string =>
  `# ${tool}: the members, each checked in its own run\npre-commit:\n  jobs:\n    - name: ${tool}\n      exclude:\n        - "<unit folders>/**"\n`;

// The templates of the root's files that skip the members: lefthook's jobs, rumdl's and yamllint's.
const skipRelease: Files = {
  'templates/project/common/lefthook/lefthook.yaml': 'extends:\n  - <parts>\n',
  'templates/project/markdown/rumdl/.rumdl.toml':
    '# rumdl: the members\n[global]\nexclude = [\n  "<unit folders>/**",\n]\n',
  'templates/project/shell/shellcheck/lefthook.yaml': skipJobOf('shellcheck'),
  'templates/project/shell/shfmt/lefthook.yaml': skipJobOf('shfmt'),
  'templates/project/yaml/yamllint/.yamllint.yaml':
    '# yamllint: the members\nignore: |\n  /<unit folders>/**\n',
};

const skipFiles: Files = {
  '.rumdl.toml': '[global]\nexclude = ["apps/**", "packages/**"]\n',
  '.yamllint.yaml': 'ignore: |\n  /apps/**\n  /packages/**\n  /.venv/\n  node_modules/\n',
  'lefthook.yaml': lefthookOf(SKIPPING_JOBS),
};

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
          ...wired,
          'biome.json': '{}\n',
        },
      },
      warnings: [
        toolWiredNowhere({
          tool: 'biome',
          unit: '',
        }),
      ],
    },
    {
      condition: 'a folder no unit names keeps a file that takes parts',
      fixture: {
        project: {
          ...wired,
          'tools/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'tools/biome.json',
        ],
      },
      warnings: [
        folderKeepsConfig({
          folder: 'tools',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition: 'a file lacks more than three parts and names more than three beyond them',
      fixture: {
        project: {
          ...wired,
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
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'common/foundation/self',
                'typescript/foundation/self',
                'typescript/foundation/core',
                'typescript/foundation/typescript',
              ],
            },
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
                'typescript/foundation/vue',
                'typescript/foundation/svelte',
                'typescript/foundation/solid',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a marker says more than its path, a chain runs out of order and a copy is edited',
      fixture: {
        project: pyprojectOf({
          linter: importLinterCopy.replace(
            `# from ${importLinter}`,
            `# from ${importLinter} by hand`,
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
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerSaysMore,
              tool: 'import-linter',
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
            {
              kind: WiringProblemKind.ExtendsShortOfEnd,
              tool: 'ruff',
            },
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'several tools lack parts and copies have no end or no part',
      fixture: {
        project: pyprojectOf({
          linter: `# from ${importLinter}\n[[tool.importlinter.contracts]]\nname = "no-cycle"\nancestors = ["shop"]\n`,
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
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/core',
                'vulture:python/foundation/core',
              ],
            },
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
            {
              kind: WiringProblemKind.ExtendsShortOfEnd,
              tool: 'ruff',
            },
            {
              kind: WiringProblemKind.CopyOfRemovedPart,
              part: 'python/foundation/gone',
            },
            {
              kind: WiringProblemKind.CopyNotTaken,
              part: 'python/foundation/django',
            },
          ],
        }),
      ],
    },
  ])(
    'should give each warning with the values it names when $condition',
    ({ fixture, warnings }) => {
      // Arrange
      const input = wiringOf(fixture);

      // Act
      const found = checkWiring(input);

      // Assert
      expect(found).toStrictEqual(warnings);
    },
  );

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
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
          ...wired,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a file names a part of a block another unit takes, which keeps a file of its own',
      fixture: {
        blocks: withReactDom,
        project: {
          ...wired,
          'apps/web/biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
        units: webUnits,
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a file lacks the part named after its language',
      fixture: {
        project: {
          ...wired,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/typescript',
              ],
            },
          ],
        }),
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
          ...wired,
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
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'common/foundation/common',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'the repository takes core without listing it',
      fixture: {
        units: [
          {
            blocks: ids.filter((id) => id !== 'core'),
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
            blocks: ids.filter((id) => id !== 'python'),
          },
        ],
      },
      warned: [],
    },
    {
      condition: "a tool is wired at the first of its templates' paths",
      fixture: {
        project: {
          ...wired,
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
          ...wired,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
        },
        release: {
          ...RELEASE,
          'templates/project/typescript/typescript/biome.json': '{}\n',
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/typescript',
              ],
            },
          ],
        }),
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
            blocks: ids,
          },
        ],
      },
      warned: [],
    },
    {
      condition: 'a part of a block no unit takes links to another',
      fixture: {
        blocks: chained,
        units: [
          {
            blocks: ids,
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
          linter: `${importLinterCopy}# from ${part('python/mypy/foundation/python.toml')}\n[tool.mypy]\nextend = "${part('python/mypy/foundation/python.toml')}"\n`,
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
          ...wired,
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
        toolWiredNowhere({
          tool: 'knip',
          unit: '',
        }),
        fileMiswired({
          file: '.dependency-cruiser.mjs',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/architecture/workspace',
              ],
            },
          ],
        }),
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
        fileMiswired({
          file: '.dependency-cruiser.mjs',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/architecture/workspace',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "the root of a workspace takes a part of its packages' own",
      fixture: {
        project: {
          ...wired,
          '.dependency-cruiser.mjs': packageCruiser,
        },
      },
      warned: [
        fileMiswired({
          file: '.dependency-cruiser.mjs',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/architecture/core',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'the repository is no workspace',
      fixture: {
        units: [
          {
            blocks: ids.filter((id) => id !== 'workspace'),
          },
        ],
      },
      warned: [
        fileMiswired({
          file: '.dependency-cruiser.mjs',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/architecture/core',
              ],
            },
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/architecture/workspace',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a folder below the root of a workspace takes its own parts',
      fixture: {
        project: {
          ...wired,
          'tools/lint/.dependency-cruiser.mjs': packageCruiser,
        },
        tracked: [
          'tools/lint/.dependency-cruiser.mjs',
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'tools/lint',
          path: '.dependency-cruiser.mjs',
        }),
      ],
    },
  ])('should hold each file to the parts its units take when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'it names only the parts of its blocks',
      fixture: {
        project: {
          ...wired,
          'biome.json': biomeJson([
            'common/biome/foundation/self.jsonc',
            REACT_DOM,
            'typescript/biome/foundation/vue.jsonc',
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/self',
                'typescript/foundation/core',
                'typescript/foundation/typescript',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'it names only its own parts',
      fixture: {
        project: wired,
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/vue',
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "it names only its language's parts",
      fixture: {
        project: {
          ...wired,
          'biome.json': biomeJson([
            ...BIOME_PARTS.slice(1),
            REACT_DOM,
            'typescript/biome/foundation/vue.jsonc',
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'common/foundation/self',
              ],
            },
          ],
        }),
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
      expect(warnings).toStrictEqual(warned);
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
    expect(warnings).toStrictEqual([
      fileMiswired({
        file: 'biome.json',
        problems: [
          {
            kind: WiringProblemKind.Lacks,
            parts: [
              'common/foundation/self',
              'common/architecture/core',
              'common/workflow/self',
            ],
          },
          {
            kind: WiringProblemKind.NamesBeyond,
            parts: [
              'typescript/foundation/react-dom',
            ],
          },
        ],
      }),
    ]);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: "a unit's own file lacks the part of a block it adds",
      fixture: {
        blocks: withReactDom,
        project: {
          ...wired,
          'apps/web/biome.json': biomeJson(BIOME_PARTS),
        },
        units: webUnits,
      },
      warned: [
        fileMiswired({
          file: 'apps/web/biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a member that follows a tool keeps no file of it and the root does',
      fixture: {
        blocks: withReactDom,
        units: webUnits,
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: 'apps/web',
        }),
      ],
    },
    {
      condition: "a unit's overrides lower the rule the root's file would hold it to",
      fixture: {
        blocks: withReactDom,
        units: [
          {
            blocks: ids,
          },
          {
            blocks: [
              ...ids,
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
          ...wired,
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
          ...wired,
          'biome.json': '{}\n',
        },
        units: [
          {
            lowered: [
              RULE,
            ],
          },
          {
            blocks: BIOME_IDS,
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: 'packages/kit',
        }),
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
            blocks: [
              'core',
              'typescript',
            ],
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'tools/lint',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition: "a package's marker alone wires the repository's tool",
      fixture: {
        project: {
          'packages/kit/pyproject.toml': vultureSection,
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
        toolWiredNowhere({
          tool: 'vulture',
          unit: '',
        }),
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
            blocks: BIOME_IDS,
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
            blocks: ids.filter((id) => id !== 'biome'),
          },
          {
            blocks: BIOME_IDS,
            path: 'packages/kit',
          },
          {
            blocks: BIOME_IDS,
            path: 'packages/kit/inner',
          },
        ],
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: 'packages/kit',
        }),
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
            blocks: ids.filter((id) => id !== 'biome'),
          },
          {
            blocks: BIOME_IDS,
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: 'packages/kit',
        }),
        folderKeepsConfig({
          folder: 'packages/kitten',
          path: 'biome.json',
        }),
        fileMiswired({
          file: 'packages/kitten/biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'common/foundation/self',
                'typescript/foundation/self',
                'typescript/foundation/core',
                'typescript/foundation/typescript',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "a package's tool is wired in a folder of its own below it",
      fixture: {
        blocks: withReactDom,
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
            blocks: ids.filter((id) => id !== 'biome'),
          },
          {
            blocks: [
              ...BIOME_IDS,
              'react-dom',
            ],
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'packages/kit/config',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition:
        'a folder of its own below a unit nested in another, listed before it, wires its tool',
      fixture: {
        blocks: withReactDom,
        project: {
          ...UNBIOMED,
          'packages/kit/biome.json': biomeJson(BIOME_PARTS),
          'packages/kit/inner/config/biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
        },
        tracked: [
          'packages/kit/inner/config/biome.json',
        ],
        units: [
          {
            blocks: ids.filter((id) => id !== 'biome'),
          },
          {
            blocks: [
              ...BIOME_IDS,
              'react-dom',
            ],
            path: 'packages/kit/inner',
          },
          {
            blocks: BIOME_IDS,
            path: 'packages/kit',
          },
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'packages/kit/inner/config',
          path: 'biome.json',
        }),
      ],
    },
  ])('should hold each file to the units it serves when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'a hidden folder keeps it',
      fixture: {
        project: {
          ...wired,
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
          ...wired,
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
          ...wired,
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
          ...wired,
          'v1.2/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'v1.2/biome.json',
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'v1.2',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition: 'a folder no unit names keeps one that names no part',
      fixture: {
        project: {
          ...wired,
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
          ...wired,
          'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
          'tools/lint/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'biome.json',
          'tools/lint/biome.json',
        ],
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/typescript',
              ],
            },
          ],
        }),
        folderKeepsConfig({
          folder: 'tools/lint',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition: 'git does not track it',
      fixture: {
        project: {
          ...wired,
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
          ...wired,
          'tools/lint/.dependency-cruiser.mjs': packageCruiser,
          'tools/lint/biome.json': biomeJson(BIOME_PARTS),
        },
        tracked: [
          'tools/lint/biome.json',
          'tools/lint/.dependency-cruiser.mjs',
        ],
      },
      warned: [
        folderKeepsConfig({
          folder: 'tools/lint',
          path: '.dependency-cruiser.mjs',
        }),
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
        wiringFileUnreadable('biome.json'),
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
          ...wired,
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
        folderKeepsConfig({
          folder: 'tools/lint',
          path: '.github/workflows/ci.yml',
        }),
      ],
    },
  ])("should check a file at a template's path when $condition", ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'a comment names a part it does not take',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}// ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment opens with a hash',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}# ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment opens a block',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}/* ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'a comment goes on in a block',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)} \t* ${part(REACT_DOM)}\n`,
        },
      },
      warned: [],
    },
    {
      condition: 'code follows a comment on its line',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"a": 1 // ${part(REACT_DOM)}\n`,
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "a path of the project's own holds the part's",
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"plugins": ["tools/presets/${REACT_DOM}"]\n`,
        },
      },
      warned: [],
    },
    {
      condition: "a path of the project's own holds the part's and the project lists a pack",
      fixture: {
        packs: [
          'packs/acme',
        ],
        project: {
          ...wired,
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
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"plugins": ["tools/presets/typescript/biome/foundation/vue.jsonc", "${part(REACT_DOM)}"]\n`,
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'it names a part twice',
      fixture: {
        project: {
          ...wired,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
            REACT_DOM,
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a part has no extension',
      fixture: {
        project: {
          ...wired,
          'biome.json': biomeJson([
            ...BIOME_PARTS,
            'typescript/biome/foundation/react-dom',
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "a line ends with a part's name",
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}${part('typescript/biome/foundation/react-dom')}\n`,
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "it names the tool's bindings",
      fixture: {
        project: {
          ...wired,
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
          ...wired,
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
          ...wired,
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
          ...wired,
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
          ...wired,
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
        packs: [
          './packs/acme',
        ],
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'typescript/foundation/acme',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'it names a part by the path of a pack the project does not list',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by the path of a pack only a member lists, from its own folder',
      fixture: {
        packs: [
          'apps/web/packs/acme',
        ],
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by a path the project lists as other than a pack',
      fixture: {
        project: {
          ...wired,
          'biome.json': `${biomeJson(BIOME_PARTS)}"acme": "packs/acme/presets/typescript/biome/foundation/acme.jsonc"\n`,
          'packs/acme/presets/typescript/biome/foundation/acme.jsonc': '{}\n',
        },
      },
      warned: [],
    },
    {
      condition: 'it names a part by the path of a pack that holds no part',
      fixture: {
        packs: [
          'packs/empty',
        ],
        project: {
          ...wired,
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
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    copy: string;
    original: string;
    warned: ProjectWarning[];
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
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy changes the text before the package',
      copy: 'ancestor = ["shop"]\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'ancestors = ["<package>"]\n',
    },
    {
      condition: 'the copy changes the text after the package',
      copy: 'ancestors = ["shop"],\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
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
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'the copy leaves the second of two packages empty',
      copy: 'layers = ["s.a", ".b"]\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'the copy loses the text between two packages',
      copy: 'layers = ["shop.a" "shop.b"]\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'layers = ["<package>.a", "<package>.b"]\n',
    },
    {
      condition: 'two packages sit side by side',
      copy: 'name = "shop"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
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
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
      original: 'min = 60\n',
    },
    {
      condition: 'the copy holds a line more',
      copy: 'min = 60\nmax = 90\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
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
        linter: `# from ${importLinter}\n${copy}# end ${importLinter}\n`,
      }),
      release: {
        ...RELEASE,
        'presets/python/import-linter/foundation/core.toml': original,
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    vulture: string;
    warned: ProjectWarning[];
  }>([
    {
      condition: "it names a path of the project's own",
      vulture: `${vultureSection}# from tools/presets/python/vulture/foundation/old.toml\n`,
      warned: [],
    },
    {
      condition: 'it names the folder of an axis',
      vulture: `${vultureSection}# from ${part('python/vulture/foundation')}\n`,
      warned: [],
    },
    {
      condition: 'it names a part of another tool',
      vulture: `${vultureSection}# from ${part('python/osv-scanner/foundation/core.toml')}\n`,
      warned: [],
    },
    {
      condition: 'it names a file in a folder of an axis',
      vulture: `${vultureSection}# from ${part('python/vulture/foundation/sub/core.toml')}\n`,
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyOfRemovedPart,
              part: 'python/foundation/sub',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it lists a second path after a comma',
      vulture: vultureSection.replace(
        `# from ${vulturePart}`,
        `# from ${vulturePart},${part('python/vulture/foundation/django.toml')}`,
      ),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerSaysMore,
              tool: 'vulture',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it opens with no blank after the hash',
      vulture: vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 80\n').replace(
        '# from',
        '#from',
      ),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it is indented',
      vulture: vultureCopy('[tool.vulture]\npaths = ["src"]\nmin_confidence = 80\n').replace(
        '# from',
        ' \t# \tfrom',
      ),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyEdited,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it follows code on its line',
      vulture: `min_confidence = 80 # from ${vulturePart}\n`,
      warned: [],
    },
    {
      condition: 'its end names another part',
      vulture: vultureSection.replace(`# end ${vulturePart}`, `# end ${importLinter}`),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'its end comes before it',
      vulture: `# end ${vulturePart}\n${vultureSection.replace(`# end ${vulturePart}`, '')}`,
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'its end is indented with no blank after the hash',
      vulture: vultureSection.replace(`# end ${vulturePart}`, ` \t#end ${vulturePart}`),
      warned: [],
    },
    {
      condition: 'its end follows code on its line',
      vulture: vultureSection.replace(
        `# end ${vulturePart}`,
        `min_confidence = 60 # end ${vulturePart}`,
      ),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it ends with blanks',
      vulture: vultureSection.replace(`# from ${vulturePart}`, `# from ${vulturePart} \t `),
      warned: [],
    },
    {
      condition: 'its end is no comment',
      vulture: vultureSection.replace(`# end ${vulturePart}`, `end ${vulturePart}`),
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.CopyWithoutEnd,
              part: 'python/foundation/core',
            },
          ],
        }),
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
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    links: string[];
    warned: ProjectWarning[];
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
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
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
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
  ])(
    "should hold a chain's marker to every link in order when it names $links",
    ({ links, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: chained,
        project: pyprojectOf({
          ruff: ruffConfig(links, 'fastapi'),
        }),
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnings).toStrictEqual(warned);
    },
  );

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'a comment extends a link short of the end',
      fixture: {
        project: pyprojectOf({
          ruff: `${ruffSection}# extend = "${part('python/ruff/foundation/self.toml')}"\n`,
        }),
      },
      warned: [],
    },
    {
      condition: 'it extends a link short of the end with no blank around the sign',
      fixture: {
        project: pyprojectOf({
          ruff: `${ruffSection}extend="${part('python/ruff/foundation/self.toml')}"\n`,
        }),
      },
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.ExtendsShortOfEnd,
              tool: 'ruff',
            },
          ],
        }),
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
          ruff: `${ruffSection}extend = "${part('typescript/ruff/foundation/self.toml')}"\n`,
        }),
        release: {
          ...RELEASE,
          'presets/typescript/ruff/foundation/self.toml': 'line-length = 100\n',
        },
      },
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'ruff:typescript/foundation/self',
              ],
            },
          ],
        }),
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
        blocks: chained,
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
              ...ids,
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
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    line: string;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'it extends a part by its file',
      line: 'extend = "pytest.toml"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it extends a part with no blank around the sign',
      line: 'extends="pytest.toml"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it extends a part with tabs around the sign',
      line: 'extend\t=\t"pytest.toml"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it extends a part in a folder, with a comment after it',
      line: 'line-length = 100\nextend = "../shared/pytest.toml" # the tests\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it extends a part by its name alone',
      line: 'extend = "pytest"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'ruff:python/foundation/pytest',
              ],
            },
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'the line is indented',
      line: ' extend = "pytest.toml"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'the line quotes no path',
      line: 'extend = pytest.toml\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
    {
      condition: 'it extends a block that has no part',
      line: 'extend = "django.toml"\n',
      warned: [
        fileMiswired({
          file: 'pyproject.toml',
          problems: [
            {
              kind: WiringProblemKind.MarkerOutOfOrder,
              tool: 'ruff',
            },
          ],
        }),
      ],
    },
  ])('should take the link a chained part extends when $condition', ({ line, warned }) => {
    // Arrange
    const input = wiringOf({
      blocks: [
        ...chained,
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
            ...ids,
            'fastapi',
          ],
        },
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'a template cannot be read',
      fixture: {
        unreadable: [
          '.droneey/constitution/templates/project/common/osv-scanner/mise.toml',
        ],
      },
      warned: [
        wiringFileUnreadable(
          '.droneey/constitution/templates/project/common/osv-scanner/mise.toml',
        ),
      ],
    },
    {
      condition: 'a part of a chain cannot be read',
      fixture: {
        unreadable: [
          '.droneey/constitution/presets/python/ruff/foundation/core.toml',
        ],
      },
      warned: [
        wiringFileUnreadable('.droneey/constitution/presets/python/ruff/foundation/core.toml'),
      ],
    },
    {
      condition: 'a part a file lists by its path cannot be read',
      fixture: {
        unreadable: [
          '.droneey/constitution/presets/common/biome/foundation/self.jsonc',
        ],
      },
      warned: [],
    },
    {
      condition: 'a tracked file is gone from the folder',
      fixture: {
        tracked: [
          'tools/lint/biome.json',
        ],
      },
      warned: [],
    },
    {
      condition: 'a tracked file below a unit that has none of its own is gone from the folder',
      fixture: {
        project: UNBIOMED,
        tracked: [
          'tools/lint/biome.json',
        ],
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: '',
        }),
      ],
    },
  ])('should warn only of the files it reads and cannot when $condition', ({ fixture, warned }) => {
    // Arrange
    const input = wiringOf(fixture);

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it('should warn of a part that cannot be read and leave its copy unjudged', () => {
    // Arrange
    const input = wiringOf({
      project: pyprojectOf({
        linter: `# from ${importLinter}\n# end ${importLinter}\n`,
      }),
      unreadable: [
        '.droneey/constitution/presets/python/import-linter/foundation/core.toml',
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual([
      wiringFileUnreadable(
        '.droneey/constitution/presets/python/import-linter/foundation/core.toml',
      ),
    ]);
  });

  it.each<{
    condition: string;
    files: Files;
    warned: ProjectWarning[];
  }>([
    {
      condition: "each file takes the pack's parts by its path",
      files: {
        'acme.toml': `extends = "${ACME_SELF}"\n`,
        'biome.json': acmeBiome,
      },
      warned: [],
    },
    {
      condition: "Biome's file lacks the pack's part for its block",
      files: {
        'acme.toml': `extends = "${ACME_SELF}"\n`,
      },
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/acme',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: "the pack's own tool takes none of its parts",
      files: {
        'acme.toml': 'strict = true\n',
        'biome.json': acmeBiome,
      },
      warned: [
        toolWiredNowhere({
          tool: 'acme',
          unit: '',
        }),
      ],
    },
  ])("should wire a pack's parts and templates when $condition", ({ files, warned }) => {
    // Arrange
    const input = wiringOf({
      blocks: [
        ...BLOCKS,
        implementationOf('acme'),
      ],
      packs: [
        'packs/acme',
      ],
      project: {
        ...wired,
        ...PACK_FILES,
        ...files,
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it.each<{
    condition: string;
    files: Files;
    pack: string;
    warned: ProjectWarning[];
  }>([
    {
      condition: 'its files name them by their path from its folder',
      files: {
        ...packFilesIn('apps/web/packs'),
        ...memberAcmeFiles('packs/acme'),
      },
      pack: 'apps/web/packs/acme',
      warned: [],
    },
    {
      condition: 'its files name them by their path from the repository',
      files: {
        ...packFilesIn('apps/web/packs'),
        ...memberAcmeFiles('apps/web/packs/acme'),
      },
      pack: 'apps/web/packs/acme',
      warned: [
        toolWiredNowhere({
          tool: 'acme',
          unit: 'apps/web',
        }),
        fileMiswired({
          file: 'apps/web/biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/acme',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'its files name the pack the repository keeps by their path from its folder',
      files: {
        ...packFilesIn('packs'),
        ...memberAcmeFiles('../../packs/acme'),
      },
      pack: 'packs/acme',
      warned: [],
    },
    {
      condition: "its files name the pack the repository keeps by the repository's path",
      files: {
        ...packFilesIn('packs'),
        ...memberAcmeFiles('packs/acme'),
      },
      pack: 'packs/acme',
      warned: [
        toolWiredNowhere({
          tool: 'acme',
          unit: 'apps/web',
        }),
        fileMiswired({
          file: 'apps/web/biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/acme',
              ],
            },
          ],
        }),
      ],
    },
  ])(
    "should anchor a member's pack at the member's folder when $condition",
    ({ files, pack, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: [
          ...BLOCKS,
          implementationOf('acme'),
        ],
        packs: [
          pack,
        ],
        project: {
          ...wired,
          ...files,
        },
        units: [
          {
            blocks: ids,
          },
          {
            blocks: [
              ...BIOME_IDS,
              'acme',
            ],
            path: 'apps/web',
          },
        ],
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnings).toStrictEqual(warned);
    },
  );

  it.each<{
    condition: string;
    links: Readonly<Record<string, string>>;
    warned: ProjectWarning[];
  }>([
    {
      condition: "a member's link names the member's own folder",
      links: {
        'apps/web/.droneey/constitution': 'apps/web',
      },
      warned: [
        releaseLinkLoops({
          unit: 'apps/web',
        }),
      ],
    },
    {
      condition: "a member's link names the repository that holds it",
      links: {
        'apps/web/.droneey/constitution': '',
      },
      warned: [
        releaseLinkLoops({
          unit: 'apps/web',
        }),
      ],
    },
    {
      condition: "a member's link names the release's folder",
      links: {
        'apps/web/.droneey/constitution': '.droneey/constitution',
      },
      warned: [],
    },
    {
      condition: "a member's link names a folder beside it",
      links: {
        'apps/web/.droneey/constitution': 'packages/kit',
      },
      warned: [],
    },
  ])("should refuse a unit's link to the release when $condition", ({ links, warned }) => {
    // Arrange
    const input = wiringOf({
      blocks: BLOCKS.filter((block) => block.id === 'core'),
      links,
      project: {
        'apps/web/README.md': '# Web\n',
        'packages/kit/README.md': '# Kit\n',
      },
      units: [
        {
          blocks: [
            'core',
          ],
        },
        {
          blocks: [
            'core',
          ],
          path: 'apps/web',
        },
      ],
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual(warned);
  });

  it("should refuse the repository's link to the release when it names the repository", () => {
    // Arrange
    const input = wiringOf({
      links: {
        '.droneey/constitution': '',
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(
      warnings.filter((warning) => ProjectWarning.codeOf(warning) === WarningCode.Installation),
    ).toStrictEqual([
      releaseLinkLoops({
        unit: '',
      }),
    ]);
  });

  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: "it skips each member's folder",
      fixture: {},
      warned: [],
    },
    {
      condition: "the root's file cannot be read",
      fixture: {
        unreadable: [
          'biome.json',
        ],
      },
      warned: [
        wiringFileUnreadable('biome.json'),
      ],
    },
    {
      condition: 'it skips a folder that holds no member',
      fixture: {
        project: {
          ...wired,
          'biome.json': skippingBiomeOf([
            'apps',
            'packages',
            'docs/site',
          ]),
        },
      },
      warned: [
        skipOfNoMember({
          folder: 'docs/site',
          path: 'biome.json',
        }),
      ],
    },
    {
      condition: 'a line opens as an entry does and ends otherwise',
      fixture: {
        project: {
          ...wired,
          'biome.json': skippingBiomeOf([
            'apps',
            'packages',
          ]).replace('"files"', '"!!docs": true,\n  "files"'),
        },
      },
      warned: [],
    },
    {
      condition: 'it leaves a member out',
      fixture: {
        project: {
          ...wired,
          'biome.json': skippingBiomeOf([
            'apps',
          ]),
        },
      },
      warned: [
        memberNotSkipped({
          member: 'packages/kit',
          path: 'biome.json',
          tool: 'biome',
        }),
      ],
    },
    {
      condition: 'an entry names no folder',
      fixture: {
        project: {
          ...wired,
          'biome.json': skippingBiomeOf([
            'apps',
            '',
          ]),
        },
      },
      warned: [
        memberNotSkipped({
          member: 'packages/kit',
          path: 'biome.json',
          tool: 'biome',
        }),
      ],
    },
    {
      condition: 'the root does not follow the tool',
      fixture: {
        project: {
          ...UNBIOMED,
          'biome.json': skippingBiomeOf([]),
        },
        units: [
          {
            blocks: ids.filter((id) => id !== 'biome'),
          },
          ...skippedMembers,
        ],
      },
      warned: [],
    },
    {
      condition: 'the root keeps no file of the tool',
      fixture: {
        project: UNBIOMED,
      },
      warned: [
        toolWiredNowhere({
          tool: 'biome',
          unit: '',
        }),
      ],
    },
  ])(
    "should hold the units the root's file skips to the members when $condition",
    ({ fixture, warned }) => {
      // Arrange
      const input = wiringOf({
        project: {
          ...wired,
          'biome.json': skippingBiomeOf([
            'apps',
            'packages',
          ]),
        },
        release: {
          ...RELEASE,
          'templates/project/common/biome/biome.json':
            '{\n  "extends": ["<parts>"],\n  "files": {\n    "includes": [\n      "!!<unit folders>"\n    ]\n  }\n}\n',
        },
        units: [
          {},
          ...skippedMembers,
        ],
        ...fixture,
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnings).toStrictEqual(warned);
    },
  );

  it.each<{
    condition: string;
    project?: Files;
    release?: Files;
    warned: ProjectWarning[];
  }>([
    {
      condition: "each job and each file skips each member's folder",
      warned: [],
    },
    {
      condition: 'a job skips a folder that holds no member',
      project: {
        'lefthook.yaml': lefthookOf([
          {
            exclude: [
              ...memberFolders,
              'docs/site/**',
            ],
            name: 'shellcheck',
          },
          {
            exclude: memberFolders,
            name: 'shfmt',
          },
        ]),
      },
      warned: [
        skipOfNoMember({
          folder: 'docs/site',
          path: 'lefthook.yaml',
        }),
      ],
    },
    {
      condition: 'a job leaves a member out',
      project: {
        'lefthook.yaml': lefthookOf([
          {
            exclude: memberFolders,
            name: 'shellcheck',
          },
          {
            exclude: [
              'apps/**',
            ],
            name: 'shfmt',
          },
        ]),
      },
      warned: [
        memberNotSkipped({
          member: 'packages/kit',
          path: 'lefthook.yaml',
          tool: 'shfmt',
        }),
      ],
    },
    {
      condition: "another job's exclude names a folder no member lies in",
      project: {
        'lefthook.yaml': lefthookOf([
          {
            exclude: [
              'packages/kit/templates/**',
            ],
            name: 'ruff',
          },
          ...SKIPPING_JOBS,
        ]),
      },
      warned: [],
    },
    {
      condition: "the root's file lacks a tool's job",
      project: {
        'lefthook.yaml': lefthookOf(SKIPPING_JOBS.slice(0, 1)),
      },
      warned: [
        memberNotSkipped({
          member: 'apps/web',
          path: 'lefthook.yaml',
          tool: 'shfmt',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: 'lefthook.yaml',
          tool: 'shfmt',
        }),
      ],
    },
    {
      condition: "the root's file holds no jobs",
      project: {
        'lefthook.yaml': 'pre-commit:\n  parallel: true\n',
      },
      warned: [
        memberNotSkipped({
          member: 'apps/web',
          path: 'lefthook.yaml',
          tool: 'shellcheck',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: 'lefthook.yaml',
          tool: 'shellcheck',
        }),
        memberNotSkipped({
          member: 'apps/web',
          path: 'lefthook.yaml',
          tool: 'shfmt',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: 'lefthook.yaml',
          tool: 'shfmt',
        }),
      ],
    },
    {
      condition: "the root's file does not parse",
      project: {
        '.rumdl.toml': '[global]\nexclude = [\n',
      },
      warned: [
        memberNotSkipped({
          member: 'apps/web',
          path: '.rumdl.toml',
          tool: 'rumdl',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: '.rumdl.toml',
          tool: 'rumdl',
        }),
      ],
    },
    {
      condition: "the root's file lacks the table its list lies in",
      project: {
        '.rumdl.toml': 'exclude = ["apps/**", "packages/**"]\n',
      },
      warned: [
        memberNotSkipped({
          member: 'apps/web',
          path: '.rumdl.toml',
          tool: 'rumdl',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: '.rumdl.toml',
          tool: 'rumdl',
        }),
      ],
    },
    {
      condition: 'an entry of a list is a list of its own',
      project: {
        '.rumdl.toml':
          '[global]\nexclude = [["a", "b", "c", "d", "e"], "apps/**", "packages/**"]\n',
      },
      warned: [],
    },
    {
      condition: "a file's lines skip a folder that holds no member",
      project: {
        '.yamllint.yaml': 'ignore: |\n  /apps/**\n  /packages/**\n  /docs/site/**\n',
      },
      warned: [
        skipOfNoMember({
          folder: 'docs/site',
          path: '.yamllint.yaml',
        }),
      ],
    },
    {
      condition: 'a job is found by every plain setting its template gives it',
      project: {
        'lefthook.yaml':
          'pre-commit:\n  jobs:\n    - name: shellcheck\n      stage_fixed: true\n      exclude: ["apps/**"]\n    - name: shfmt\n      stage_fixed: true\n      glob: ["*.sh"]\n      exclude: ["apps/**", "packages/**"]\n',
      },
      release: {
        'templates/project/shell/shellcheck/lefthook.yaml':
          'pre-commit:\n  jobs:\n    - name: shellcheck\n      exclude: ["apps/**", "packages/**"]\n',
        'templates/project/shell/shfmt/lefthook.yaml':
          'pre-commit:\n  jobs:\n    - name: shfmt\n      stage_fixed: true\n      glob: ["*.sh"]\n      exclude: ["<unit folders>/**"]\n',
      },
      warned: [],
    },
    {
      condition: "a job's template gives it no plain setting and the root's list opens with a text",
      project: {
        'lefthook.yaml':
          'pre-commit:\n  jobs:\n    - note\n    - name: shellcheck\n      exclude: ["apps/**", "packages/**"]\n',
      },
      release: {
        'templates/project/shell/shfmt/lefthook.yaml':
          'pre-commit:\n  jobs:\n    - exclude: ["<unit folders>/**"]\n',
      },
      warned: [],
    },
    {
      condition: 'a line is only the text around a folder',
      project: {
        '.yamllint.yaml': 'ignore: |\n  /**\n',
      },
      warned: [
        memberNotSkipped({
          member: 'apps/web',
          path: '.yamllint.yaml',
          tool: 'yamllint',
        }),
        memberNotSkipped({
          member: 'packages/kit',
          path: '.yamllint.yaml',
          tool: 'yamllint',
        }),
      ],
    },
    {
      condition: "a job's template gives its list as one text",
      project: {
        'lefthook.yaml':
          'pre-commit:\n  jobs:\n    - name: shellcheck\n      exclude: ["apps/**", "packages/**"]\n    - name: shfmt\n      exclude: |\n        apps/**\n        packages/**\n',
      },
      release: {
        'templates/project/shell/shfmt/lefthook.yaml':
          'pre-commit:\n  jobs:\n    - name: shfmt\n      exclude: |\n        <unit folders>/**\n',
      },
      warned: [],
    },
    {
      condition: 'a template names <unit folders> only in a comment',
      project: {
        'lefthook.yaml': lefthookOf(SKIPPING_JOBS.slice(0, 1)),
      },
      release: {
        'templates/project/shell/shfmt/lefthook.yaml':
          '# shfmt: no <unit folders> to skip\npre-commit:\n  jobs:\n    - name: shfmt\n',
      },
      warned: [],
    },
    {
      condition: 'a template does not parse',
      project: {
        'lefthook.yaml': lefthookOf(SKIPPING_JOBS.slice(0, 1)),
      },
      release: {
        'templates/project/shell/shfmt/lefthook.yaml': 'pre-commit: [<unit folders>\n',
      },
      warned: [],
    },
  ])(
    'should hold the folders each job and file of the root skips to the members when $condition',
    ({ project, release, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: [
          ...BLOCKS,
          implementationOf('lefthook'),
          implementationOf('rumdl'),
          implementationOf('shellcheck'),
          implementationOf('shfmt'),
          implementationOf('yamllint'),
        ],
        project: {
          ...wired,
          ...skipFiles,
          ...project,
        },
        release: {
          ...RELEASE,
          ...skipRelease,
          ...release,
        },
        units: [
          {},
          ...skippedMembers,
        ],
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnings).toStrictEqual(warned);
    },
  );

  it('should read a file whose lines end with carriage returns when its copies hold', () => {
    // Arrange
    const input = wiringOf({
      project: {
        ...wired,
        'pyproject.toml': pyproject.replaceAll('\n', '\r\n'),
      },
    });

    // Act
    const warnings = checkWiring(input);

    // Assert
    expect(warnings).toStrictEqual([]);
  });
  it.each<{
    condition: string;
    fixture: WiringFixture;
    warned: ProjectWarning[];
  }>([
    {
      condition: "only the root follows the tool and its file takes a member's part",
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
            'ruff',
          ]),
        },
      },
      warned: [],
    },
    {
      condition: "only the root follows the tool and its file lacks a member's part",
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'lefthook.yaml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'common/workflow/ruff',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'a member that does not follow the tool keeps a file of it',
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
          'packages/check/lefthook.yaml': hooksOf([
            'ruff',
          ]),
        },
      },
      warned: [
        fileMiswired({
          file: 'lefthook.yaml',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'common/workflow/ruff',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition:
        'a member that follows the tool keeps its own file and one that does not runs a tool with its part',
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
          'packages/check/lefthook.yaml': hooksOf([
            'ruff',
          ]),
        },
        units: hooksOwnUnits,
      },
      warned: [],
    },
    {
      condition: "a member that follows the tool keeps its own file and the root's names its part",
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
            'ruff',
          ]),
          'packages/check/lefthook.yaml': hooksOf([
            'ruff',
          ]),
        },
        units: hooksOwnUnits,
      },
      warned: [
        fileMiswired({
          file: 'lefthook.yaml',
          problems: [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: [
                'common/workflow/ruff',
              ],
            },
          ],
        }),
      ],
    },
    {
      condition: 'no unit follows the tool',
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
        },
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
      warned: [],
    },
    {
      condition: "members follow the tool, each with its own file, and the root's lacks their part",
      fixture: {
        project: {
          ...hooksWired,
          'apps/web/biome.json': biomeJson([
            ...BIOME_PARTS,
            REACT_DOM,
          ]),
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
        },
        units: [
          {
            blocks: hooksRootBlocks,
          },
          {
            blocks: [
              'core',
              'typescript',
              'biome',
              'react-dom',
            ],
            path: 'apps/web',
          },
        ],
      },
      warned: [],
    },
    {
      condition: 'a member that does not follow the tool takes a block with its part',
      fixture: {
        project: {
          ...hooksWired,
          'lefthook.yaml': hooksOf([
            'biome',
          ]),
        },
        units: [
          {
            blocks: hooksRootBlocks,
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
      warned: [
        fileMiswired({
          file: 'biome.json',
          problems: [
            {
              kind: WiringProblemKind.Lacks,
              parts: [
                'typescript/foundation/react-dom',
              ],
            },
          ],
        }),
      ],
    },
  ])(
    "should hold the root's file of a tool no member follows to every unit, and of one a member follows to the root alone, when $condition",
    ({ fixture, warned }) => {
      // Arrange
      const input = wiringOf({
        blocks: hooksBlocks,
        release: {
          ...RELEASE,
          ...HOOKS_RELEASE,
        },
        units: hooksUnits,
        ...fixture,
      });

      // Act
      const warnings = checkWiring(input);

      // Assert
      expect(warnings).toStrictEqual(warned);
    },
  );
});
