import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { mentionedOf } from '../hook.fixtures';
import { removePluginRoots } from '../plugin-root.fixtures';
import { ConfigKey, removeProjects } from '../project.fixtures';
import {
  biomeJson,
  biomeParts,
  createWiredPluginRoot,
  createWiredProject,
  cruiserConfig,
  digestOf,
  importLinterCopy,
  osvTask,
  PACK,
  packConfig,
  packFiles,
  part,
  rootCruiser,
  ruffMarker,
  vultureCopy,
  wiredConfig,
  wiredMember,
  wiredWorkspace,
  wiringListOf,
  wiringOf,
} from '../wiring.fixtures';

let root = '';

const packageCruiser = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/core.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);
const vulture = part('python/vulture/foundation/core.toml');
// A member that runs Biome alone of the repository's tools, with react-dom's part beside its own.
const WEB_ONLY: Partial<Record<ConfigKey, string>> = {
  [ConfigKey.Implementations]: '[biome, react-dom]',
  [ConfigKey.Languages]: '[typescript]',
} as const;

interface Case {
  config?: string;
  files?: Readonly<Record<string, string>>;
  // the constitution.yaml of the member apps/web
  member?: string;
  name: string;
  omit?: readonly string[];
  tracked?: Readonly<Record<string, string>>;
  warned: string[][];
}

// Each warning given, read as the names its counterpart in the case names.
const warnedOf = (input: { project: string; warned: string[][] }): readonly string[][] =>
  wiringOf(
    digestOf({
      project: input.project,
      root,
    }),
  ).map((line, index) => [
    ...mentionedOf({
      names: input.warned[index] ?? [],
      text: line,
    }),
  ]);

beforeAll(() => {
  root = createWiredPluginRoot();
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
});

describe('the wiring of a project', () => {
  it.each<Case>([
    {
      name: 'each configuration takes the parts of its blocks',
      tracked: {
        'packages/kit/.dependency-cruiser.mjs': packageCruiser,
      },
      warned: [],
    },
    {
      files: {
        'biome.json': biomeJson(biomeParts.slice(0, -1)),
      },
      name: 'a configuration lacks a part of its blocks',
      warned: [
        [
          'biome.json',
          'typescript/foundation/typescript',
        ],
      ],
    },
    {
      files: {
        'biome.json': biomeJson([
          ...biomeParts,
          part('typescript/biome/foundation/react-dom.jsonc'),
        ]),
      },
      name: 'a configuration names a part of a block that is not active',
      warned: [
        [
          'biome.json',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      files: {
        'biome.json': `${biomeJson(biomeParts)}// ${part('typescript/biome/foundation/react-dom.jsonc')}\n${JSON.stringify(
          {
            plugins: [
              'tools/presets/typescript/biome/foundation/react-dom.jsonc',
            ],
          },
        )}\n`,
      },
      name: "a part's path sits in a comment or under a path of the project's own",
      warned: [],
    },
    {
      files: {
        'biome.json': '{}\n',
      },
      name: "a tool's only configuration takes no part",
      warned: [
        [
          'biome',
          '.',
        ],
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${importLinterCopy()}`,
      },
      name: 'no file names the parts of an active tool',
      warned: [
        [
          'vulture',
          '.',
        ],
      ],
    },
    {
      files: {
        'mise.toml': '[tasks."audit:check"]\nrun = "osv-scanner --licenses=MIT ."\n',
      },
      name: "a command-line tool's task names no part",
      warned: [
        [
          'osv-scanner',
          '.',
        ],
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(80)}\n${importLinterCopy()}`,
      },
      name: 'a copy is edited between its two lines',
      warned: [
        [
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60).replace(/# end .*\n/u, '')}\n${importLinterCopy()}`,
      },
      name: 'a copy has no line that ends it',
      warned: [
        [
          'pyproject.toml',
          'python/foundation/core',
        ],
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60).replace(vulture, `${vulture} by hand`)}\n${importLinterCopy()}`,
      },
      name: 'a marker says more than its path',
      warned: [
        [
          'pyproject.toml',
          'vulture',
        ],
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60).replaceAll('vulture/foundation/core.toml', 'vulture/foundation/gone.toml')}\n${importLinterCopy()}`,
      },
      name: 'a copy names a part the release no longer has',
      warned: [
        [
          'pyproject.toml',
          'python/foundation/gone',
        ],
      ],
    },
    {
      files: {
        '.dependency-cruiser.mjs': packageCruiser,
      },
      name: "the workspace's root takes a part its packages hold",
      warned: [
        [
          '.dependency-cruiser.mjs',
          'typescript/architecture/core',
        ],
      ],
    },
    {
      name: 'a configuration in a folder no unit names lacks a part',
      tracked: {
        'packages/kit/.dependency-cruiser.mjs': rootCruiser,
      },
      warned: [
        [
          'packages/kit/.dependency-cruiser.mjs',
          'typescript/architecture/core',
        ],
      ],
    },
    {
      name: 'the folder of a configuration that lacks a part is named in other than ASCII',
      tracked: {
        'packages/kät/.dependency-cruiser.mjs': rootCruiser,
      },
      warned: [
        [
          'packages/kät/.dependency-cruiser.mjs',
          'typescript/architecture/core',
        ],
      ],
    },
    {
      files: {
        'packages/kit/.dependency-cruiser.mjs': rootCruiser,
      },
      name: 'git does not track a configuration in a folder no unit names',
      warned: [],
    },
    {
      config: wiredConfig(
        {
          [ConfigKey.Axes]: '[]',
        },
        [],
      ),
      files: {
        '.dependency-cruiser.mjs': rootCruiser,
      },
      name: 'the root of a workspace that follows no architecture names its workspace part',
      warned: [
        [
          '.dependency-cruiser.mjs',
          'typescript/architecture/workspace',
        ],
      ],
    },
    {
      config: wiredConfig(
        {
          [ConfigKey.Axes]: '[]',
        },
        [],
      ),
      files: {
        '.dependency-cruiser.mjs': cruiserConfig([
          'typescript/dependency-cruiser/foundation/self.mjs',
        ]),
      },
      name: 'the root of a workspace that follows no architecture takes its own part alone',
      warned: [],
    },
  ])('should warn as each file needs when $name', ({ config, files, omit, tracked, warned }) => {
    // Arrange
    const project = createWiredProject({
      ...(config === undefined
        ? {}
        : {
            config,
          }),
      ...(files === undefined
        ? {}
        : {
            files,
          }),
      ...(omit === undefined
        ? {}
        : {
            omit,
          }),
      ...(tracked === undefined
        ? {}
        : {
            tracked,
          }),
    });

    // Act
    const found = warnedOf({
      project,
      warned,
    });

    // Assert
    expect(found).toStrictEqual(warned);
  });

  it.each<Case>([
    {
      files: {
        'apps/web/biome.json': biomeJson(biomeParts),
      },
      name: "a unit's own file lacks the part of a block the unit adds",
      warned: [
        [
          'apps/web/biome.json',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      name: 'a unit that follows a tool keeps no file of it, though the root does',
      warned: [
        [
          'biome',
          'apps/web',
        ],
      ],
    },
    {
      files: {
        'apps/web/biome.json': biomeJson([
          ...biomeParts,
          part('typescript/biome/foundation/react-dom.jsonc'),
        ]),
      },
      name: 'the unit keeps its own file',
      warned: [],
    },
    {
      member: wiredMember([], {
        ...WEB_ONLY,
        [ConfigKey.Overrides]:
          '\n  - rule: configuration-takes-every-part-of-its-blocks\n    level: MAY\n    reason: "The site keeps its own configuration"',
      }),
      name: "the unit's override lowers the rule the root's file would hold it to",
      warned: [],
    },
  ])('should hold a file to the units it serves when $name', ({ files, member, warned }) => {
    // Arrange
    const project = createWiredProject({
      files: {
        ...wiredWorkspace({
          'apps/web': member ?? wiredMember([], WEB_ONLY),
        }),
        ...files,
      },
    });

    // Act
    const found = warnedOf({
      project,
      warned,
    });

    // Assert
    expect(found).toStrictEqual(warned);
  });

  it("should leave out the root's task of a tool the unit's own mise.toml does not run", () => {
    // Arrange
    const project = createWiredProject({
      files: {
        ...wiredWorkspace({
          'apps/web': wiredMember([], {
            [ConfigKey.Implementations]: '[hadolint]',
            [ConfigKey.Languages]: '[dockerfile]',
          }),
        }),
        'apps/web/mise.toml': `[tasks."dockerfile:check"]\nrun = "hadolint --config ${part('dockerfile/hadolint/foundation/dockerfile.yaml')} Dockerfile"\n`,
        'mise.toml': osvTask,
      },
    });

    // Act
    const found = warnedOf({
      project,
      warned: [],
    });

    // Assert
    expect(found).toStrictEqual([]);
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
          'pyproject.toml',
          'python/foundation/pytest',
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
          'pyproject.toml',
          'ruff',
        ],
      ],
    },
  ])(
    "should hold a chain's marker to every link in order when it names $links",
    ({ links, warned }) => {
      // Arrange
      const marker = links.map((link) => part(`python/ruff/foundation/${link}.toml`)).join(', ');
      const project = createWiredProject({
        config: wiredConfig({}, [
          'fastapi',
        ]),
        files: {
          'pyproject.toml': `# from ${marker}\n[tool.ruff]\nextend = "${part('python/ruff/foundation/fastapi.toml')}"\n\n${vultureCopy(60)}\n${importLinterCopy()}`,
        },
      });

      // Act
      const found = warnedOf({
        project,
        warned,
      });

      // Assert
      expect(found).toStrictEqual(warned);
    },
  );

  it('should warn of a folder that keeps a configuration of its own and is no member of the workspace', () => {
    // Arrange
    const project = createWiredProject({
      tracked: {
        'packages/kit/.dependency-cruiser.mjs': packageCruiser,
      },
    });

    // Act
    const context = digestOf({
      project,
      root,
    });

    // Assert
    expect(
      context
        .split('\n')
        .filter((line) => line.startsWith('- unlisted: '))
        .map((line) =>
          mentionedOf({
            names: [
              'packages/kit',
            ],
            text: line,
          }),
        ),
    ).toStrictEqual([
      [
        'packages/kit',
      ],
    ]);
  });

  it('should warn of nothing when an override lowers the rule the wiring holds', () => {
    // Arrange
    const project = createWiredProject({
      config: wiredConfig({
        [ConfigKey.Overrides]:
          '\n  - rule: configuration-takes-every-part-of-its-blocks\n    level: MAY\n    reason: "The project keeps its own configuration"',
      }),
      files: {
        'biome.json': '{}\n',
      },
    });

    // Act
    const found = warnedOf({
      project,
      warned: [],
    });

    // Assert
    expect(found).toStrictEqual([]);
  });
});

describe('the wiring ratify writes', () => {
  it("should list each file with the units it serves, each tool's template and its parts in their order", () => {
    // Arrange
    const project = createWiredProject({
      bare: true,
    });
    const expected = [
      '.dependency-cruiser.mjs (new) for .',
      'biome.json (new) for .',
      'biome .droneey/constitution/templates/project/common/biome/biome.json',
      ...biomeParts.slice(0, 1),
      'biome .droneey/constitution/templates/project/typescript/biome/biome.json',
      ...biomeParts.slice(1),
    ];

    // Act
    const listed = wiringListOf({
      project,
      root,
    });

    // Assert
    expect(listed.filter((line) => expected.includes(line))).toStrictEqual(expected);
  });

  it('should list a package under its own file of a tool when that file names no part', () => {
    // Arrange
    const project = createWiredProject({
      files: {
        ...wiredWorkspace({
          'packages/kit': wiredMember(),
        }),
        'packages/kit/.dependency-cruiser.mjs': packageCruiser,
        'packages/kit/biome.json': '{ "root": false }\n',
      },
    });

    // Act
    const listed = wiringListOf({
      project,
      root,
    });

    // Assert
    expect(listed.filter((line) => line.includes('biome.json for'))).toStrictEqual([
      'biome.json for .',
      'packages/kit/biome.json for packages/kit',
    ]);
  });
});

describe("the wiring of a pack's parts and templates", () => {
  it.each<Case>([
    {
      files: {
        'acme.toml': `extends = "${PACK}/presets/common/acme/foundation/self.toml"\n`,
        'biome.json': biomeJson([
          ...biomeParts,
          `${PACK}/presets/typescript/biome/foundation/acme.jsonc`,
        ]),
      },
      name: "each configuration takes the pack's parts by the pack's path",
      warned: [],
    },
    {
      files: {
        'acme.toml': `extends = "${PACK}/presets/common/acme/foundation/self.toml"\n`,
      },
      name: "Biome's configuration lacks the pack's part for its block",
      warned: [
        [
          'biome.json',
          'typescript/foundation/acme',
        ],
      ],
    },
    {
      files: {
        'acme.toml': 'strict = true\n',
        'biome.json': biomeJson([
          ...biomeParts,
          `${PACK}/presets/typescript/biome/foundation/acme.jsonc`,
        ]),
      },
      name: "the pack's own tool takes none of its parts",
      warned: [
        [
          'acme',
          '.',
        ],
      ],
    },
  ])('should warn as each file needs when $name', ({ files, warned }) => {
    // Arrange
    const project = createWiredProject({
      config: packConfig(),
      files: {
        ...packFiles,
        ...files,
      },
    });

    // Act
    const found = warnedOf({
      project,
      warned,
    });

    // Assert
    expect(found).toStrictEqual(warned);
  });

  it("should list the pack's template and its part by the pack's path", () => {
    // Arrange
    const project = createWiredProject({
      bare: true,
      config: packConfig(),
      files: packFiles,
    });
    const expected = [
      'acme.toml (new) for .',
      `acme ${PACK}/templates/project/common/acme/acme.toml`,
      `${PACK}/presets/common/acme/foundation/self.toml`,
      `${PACK}/presets/typescript/biome/foundation/acme.jsonc`,
    ];

    // Act
    const listed = wiringListOf({
      project,
      root,
    });

    // Assert
    expect(listed.filter((line) => expected.includes(line)).toSorted()).toStrictEqual(
      expected.toSorted(),
    );
  });
});
