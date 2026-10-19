import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { mentionedOf } from '../hook.fixtures';
import { removePluginRoots } from '../plugin-root.fixtures';
import { ConfigKey, removeProjects } from '../project.fixtures';
import {
  BIOME_PARTS,
  biomeJson,
  createWiredPluginRoot,
  createWiredProject,
  cruiserConfig,
  digestOf,
  importLinterCopy,
  PACK,
  PACK_FILES,
  packConfig,
  part,
  ruffMarker,
  vultureCopy,
  wiredConfig,
  wiringListOf,
  wiringOf,
} from '../wiring.fixtures';

let root = '';

// The root of a workspace takes only the tool's own part and the workspace's.
const ROOT_CRUISER = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
]);
const PACKAGE_CRUISER = cruiserConfig([
  'typescript/dependency-cruiser/foundation/self.mjs',
  'typescript/dependency-cruiser/architecture/core.mjs',
  'typescript/dependency-cruiser/architecture/workspace.mjs',
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
  it('should warn of nothing when each configuration takes the parts of its blocks', () => {
    // Arrange
    const project = createWiredProject({
      files: {
        '.dependency-cruiser.mjs': ROOT_CRUISER,
        'biome.json': biomeJson(BIOME_PARTS),
        'mise.toml': `[tasks."audit:check"]\nrun = "osv-scanner --licenses=${part('common/osv-scanner/foundation/core.txt')}"\n`,
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60)}\n${importLinterCopy()}`,
      },
      tracked: {
        'packages/kit/.dependency-cruiser.mjs': PACKAGE_CRUISER,
      },
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(wiring).toStrictEqual([]);
  });

  it.each<{
    files: Readonly<Record<string, string>>;
    name: string;
    names: string[];
  }>([
    {
      files: {
        'biome.json': biomeJson(BIOME_PARTS.slice(0, -1)),
      },
      name: 'a configuration lacks a part of its blocks',
      names: [
        'biome.json',
        'typescript/foundation/typescript',
      ],
    },
    {
      files: {
        'biome.json': biomeJson([
          ...BIOME_PARTS,
          part('typescript/biome/foundation/react-dom.jsonc'),
        ]),
      },
      name: 'a configuration names a part of a block that is not active',
      names: [
        'biome.json',
        'typescript/foundation/react-dom',
      ],
    },
    {
      files: {
        'biome.json': '{}\n',
      },
      name: "a tool's own configuration takes no part",
      names: [
        'biome.json',
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(80)}`,
      },
      name: 'a copy under its marker no longer repeats its part',
      names: [
        'pyproject.toml',
        'vulture',
      ],
    },
    {
      files: {
        'pyproject.toml': `${ruffMarker()}\n${vultureCopy(60).replace(/# end .*\n/u, '')}`,
      },
      name: 'a copy has no line that ends it',
      names: [
        'pyproject.toml',
        'vulture',
      ],
    },
    {
      files: {
        '.dependency-cruiser.mjs': PACKAGE_CRUISER,
      },
      name: "the workspace's root takes a part its packages hold",
      names: [
        '.dependency-cruiser.mjs',
        'typescript/architecture/core',
      ],
    },
  ])('should warn once of the file when $name', ({ files, names }) => {
    // Arrange
    const project = createWiredProject({
      files,
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(
      wiring.map((line) =>
        mentionedOf({
          names,
          text: line,
        }),
      ),
    ).toStrictEqual([
      names,
    ]);
  });

  it('should warn of a configuration in a folder no unit names when git tracks it and it lacks a part', () => {
    // Arrange
    const project = createWiredProject({
      tracked: {
        'packages/kit/.dependency-cruiser.mjs': ROOT_CRUISER,
      },
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(
      wiring.map((line) =>
        mentionedOf({
          names: [
            'packages/kit/.dependency-cruiser.mjs',
            'typescript/architecture/core',
          ],
          text: line,
        }),
      ),
    ).toStrictEqual([
      [
        'packages/kit/.dependency-cruiser.mjs',
        'typescript/architecture/core',
      ],
    ]);
  });

  it.each([
    {
      files: {
        'pyproject.toml': '[project]\nname = "shop"\n',
      },
      name: 'a file several blocks give takes none of the parts of a tool',
    },
    {
      files: {
        'packages/kit/.dependency-cruiser.mjs': ROOT_CRUISER,
      },
      name: 'git does not track a configuration in a folder no unit names',
    },
    {
      files: {
        'packages/kit/biome.json': '{}\n',
      },
      name: 'a configuration in a folder no unit names takes no part',
    },
  ])('should warn of nothing when $name', ({ files }) => {
    // Arrange
    const project = createWiredProject({
      files,
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(wiring).toStrictEqual([]);
  });

  it("should hold a unit's configuration to the parts of the blocks the unit adds", () => {
    // Arrange
    const project = createWiredProject({
      config: wiredConfig({
        [ConfigKey.Packages]: '\n  apps/web:\n    implementations: [react-dom]',
      }),
      files: {
        'apps/web/biome.json': biomeJson(BIOME_PARTS),
      },
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(
      wiring.map((line) =>
        mentionedOf({
          names: [
            'apps/web/biome.json',
            'typescript/foundation/react-dom',
          ],
          text: line,
        }),
      ),
    ).toStrictEqual([
      [
        'apps/web/biome.json',
        'typescript/foundation/react-dom',
      ],
    ]);
  });

  it.each<{
    files: Readonly<Record<string, string>>;
    name: string;
    warned: string[][];
  }>([
    {
      files: {
        'biome.json': biomeJson(BIOME_PARTS),
      },
      name: 'the root serves a unit that keeps no file of its own',
      warned: [
        [
          'biome.json',
          'typescript/foundation/react-dom',
        ],
      ],
    },
    {
      files: {
        'apps/web/biome.json': biomeJson([
          ...BIOME_PARTS,
          part('typescript/biome/foundation/react-dom.jsonc'),
        ]),
        'biome.json': biomeJson(BIOME_PARTS),
      },
      name: 'the unit keeps its own file',
      warned: [],
    },
  ])('should hold a file to the parts of every unit it serves when $name', ({ files, warned }) => {
    // Arrange
    const project = createWiredProject({
      config: wiredConfig({
        [ConfigKey.Packages]: '\n  apps/web:\n    implementations: [react-dom]',
      }),
      files,
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(
      wiring.map((line, index) =>
        mentionedOf({
          names: warned[index] ?? [],
          text: line,
        }),
      ),
    ).toStrictEqual(warned);
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
  ])(
    "should take every link a taken part's chain extends when the marker names $links",
    ({ links, warned }) => {
      // Arrange
      const marker = links.map((link) => part(`python/ruff/foundation/${link}.toml`)).join(', ');
      const project = createWiredProject({
        config: wiredConfig({
          [ConfigKey.Implementations]: '[biome, dependency-cruiser, ruff, fastapi]',
        }),
        files: {
          'pyproject.toml': `# from ${marker}\n[tool.ruff]\nextend = "${part('python/ruff/foundation/fastapi.toml')}"\n`,
        },
      });

      // Act
      const wiring = wiringOf(
        digestOf({
          project,
          root,
        }),
      );

      // Assert
      expect(
        wiring.map((line, index) =>
          mentionedOf({
            names: warned[index] ?? [],
            text: line,
          }),
        ),
      ).toStrictEqual(warned);
    },
  );

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
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(wiring).toStrictEqual([]);
  });
});

describe('the wiring ratify writes', () => {
  it("should list each file with the units it serves, each tool's template and its parts in their order", () => {
    // Arrange
    const project = createWiredProject({});
    const expected = [
      '.dependency-cruiser.mjs (new) for .',
      'biome.json (new) for .',
      'biome .droneey/constitution/templates/project/common/biome/biome.json',
      ...BIOME_PARTS.slice(0, 1),
      'biome .droneey/constitution/templates/project/typescript/biome/biome.json',
      ...BIOME_PARTS.slice(1),
    ];

    // Act
    const listed = wiringListOf({
      project,
      root,
    });

    // Assert
    expect(listed.filter((line) => expected.includes(line))).toStrictEqual(expected);
  });
});

describe("the wiring of a pack's parts and templates", () => {
  it.each<{
    files: Readonly<Record<string, string>>;
    name: string;
    warned: string[][];
  }>([
    {
      files: {
        'acme.toml': `extends = "${PACK}/presets/common/acme/foundation/self.toml"\n`,
        'biome.json': biomeJson([
          ...BIOME_PARTS,
          `${PACK}/presets/typescript/biome/foundation/acme.jsonc`,
        ]),
      },
      name: "each configuration takes the pack's parts by the pack's path",
      warned: [],
    },
    {
      files: {
        'acme.toml': `extends = "${PACK}/presets/common/acme/foundation/self.toml"\n`,
        'biome.json': biomeJson(BIOME_PARTS),
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
          ...BIOME_PARTS,
          `${PACK}/presets/typescript/biome/foundation/acme.jsonc`,
        ]),
      },
      name: "the pack's own tool takes none of its parts",
      warned: [
        [
          'acme.toml',
        ],
      ],
    },
  ])('should warn as each file needs when $name', ({ files, warned }) => {
    // Arrange
    const project = createWiredProject({
      config: packConfig(),
      files: {
        ...PACK_FILES,
        ...files,
      },
    });

    // Act
    const wiring = wiringOf(
      digestOf({
        project,
        root,
      }),
    );

    // Assert
    expect(
      wiring.map((line, index) =>
        mentionedOf({
          names: warned[index] ?? [],
          text: line,
        }),
      ),
    ).toStrictEqual(warned);
  });

  it("should list the pack's template and its part by the pack's path", () => {
    // Arrange
    const project = createWiredProject({
      config: packConfig(),
      files: PACK_FILES,
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
