import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';
import { uvBinary } from './uv.fixtures';

interface DeployedUnit {
  readonly name: string;
  readonly tools: readonly Tool[];
  readonly unit: UnitFixture;
}

interface Failure {
  readonly output: string;
  readonly tool: string;
}

enum Tool {
  Biome = 'biome',
  Tsc = 'tsc',
  Knip = 'knip',
  DependencyCruiser = 'dependency-cruiser',
  Syncpack = 'syncpack',
  Yamllint = 'yamllint',
  Tombi = 'tombi',
  Rumdl = 'rumdl',
  Shellcheck = 'shellcheck',
  Shfmt = 'shfmt',
  Lefthook = 'lefthook',
  Betterleaks = 'betterleaks',
  Ruff = 'ruff',
  Hadolint = 'hadolint',
  Dclint = 'dclint',
}

const release = join(import.meta.dir, '..', '..');
const workspace = join(release, '..', '..');

// A tool of the package's own development dependencies, as its install links it.
const bin = (tool: string): string => join(release, 'node_modules', '.bin', tool);

const SCOPE = '@';

// The folders whose packages a unit's imports resolve from, the workspace's own first.
const moduleFolders = [
  join(workspace, 'node_modules'),
  ...[
    'packages',
    'apps',
  ].flatMap((group) =>
    readdirSync(join(workspace, group)).flatMap((folder) =>
      // a group folder holds units, each with its own install
      folder.startsWith(SCOPE)
        ? readdirSync(join(workspace, group, folder)).map((unit) =>
            join(workspace, group, folder, unit, 'node_modules'),
          )
        : [
            join(workspace, group, folder, 'node_modules'),
          ],
    ),
  ),
];
const IMPORT = /^import (?:[^'"]+ from )?'([^.'][^']*)'/gm;
const NODE_PREFIX = 'node:';
const SOURCE_FILE = /\.(?:ts|tsx)$/;

// The units of the deployment, so that blocks that exclude each other, the platforms above all, sit
// in units of their own.
const deployedUnits: readonly DeployedUnit[] = [
  {
    name: 'web',
    tools: [
      Tool.Biome,
      Tool.Tsc,
      Tool.Knip,
      Tool.DependencyCruiser,
      Tool.Syncpack,
      Tool.Yamllint,
      Tool.Tombi,
      Tool.Rumdl,
      Tool.Shellcheck,
      Tool.Shfmt,
      Tool.Lefthook,
      Tool.Betterleaks,
    ],
    unit: {
      domains: [
        'analytics',
        'design-system',
        'i18n',
        'open-source',
        'privacy',
        'remote-data',
        'remote-service',
        'ui',
        'untrusted-client',
        'version-control',
      ],
      implementations: [
        'betterleaks',
        'biome',
        'bun',
        'bun-test',
        'dependency-cruiser',
        'editorconfig',
        'git',
        'knip',
        'ky',
        'lefthook',
        'lingui',
        'matomo',
        'mise',
        'osv-scanner',
        'playwright',
        'react-dom',
        'renovate',
        'rumdl',
        'shadcn',
        'shellcheck',
        'shfmt',
        'storybook',
        'stryker',
        'syncpack',
        'tailwind',
        'tanstack-form',
        'tanstack-query',
        'tanstack-router',
        'tanstack-start',
        'testing-library',
        'tombi',
        'ts-reset',
        'tsc',
        'vite',
        'yaml-js',
        'yamllint',
        'zod',
      ],
      languages: [
        'css',
        'html',
        'json',
        'markdown',
        'shell',
        'toml',
        'typescript',
        'yaml',
      ],
      name: 'web',
      platforms: [
        'browser',
      ],
    },
  },
  {
    name: 'server',
    tools: [
      Tool.Biome,
      Tool.Tsc,
      Tool.Knip,
      Tool.DependencyCruiser,
    ],
    unit: {
      domains: [
        'access-control',
        'config-file',
        'convergence',
        'distribution',
        'http-server',
        'language-model',
        'mcp-api',
        'messaging',
        'observability',
        'owned-data',
        'rest-api',
        'webhooks',
        'workspace',
      ],
      implementations: [
        'biome',
        'bun',
        'bun-test',
        'dependency-cruiser',
        'knip',
        'nestjs',
        'pino',
        'stryker',
        'tsc',
      ],
      languages: [
        'json',
        'toml',
        'typescript',
        'yaml',
      ],
      name: 'server',
      platforms: [
        'server',
      ],
    },
  },
  {
    name: 'cli',
    tools: [
      Tool.Biome,
      Tool.Tsc,
    ],
    unit: {
      implementations: [
        'biome',
        'bun',
        'commander',
        'ink',
        'tsc',
      ],
      languages: [
        'json',
        'toml',
        'typescript',
      ],
      name: 'cli',
      platforms: [
        'cli',
      ],
    },
  },
  {
    name: 'bunli',
    tools: [
      Tool.Biome,
      Tool.Tsc,
    ],
    unit: {
      implementations: [
        'biome',
        'bun',
        'bunli',
        'tsc',
      ],
      languages: [
        'json',
        'toml',
        'typescript',
      ],
      name: 'bunli',
      platforms: [
        'cli',
      ],
    },
  },
  {
    name: 'mobile',
    tools: [
      Tool.Biome,
      Tool.Tsc,
    ],
    unit: {
      implementations: [
        'biome',
        'bun',
        'expo',
        'react-native',
        'tsc',
      ],
      languages: [
        'json',
        'toml',
        'typescript',
      ],
      name: 'mobile',
      platforms: [
        'mobile',
      ],
    },
  },
  {
    name: 'python',
    tools: [
      Tool.Ruff,
      Tool.Tombi,
    ],
    unit: {
      domains: [
        'mcp-api',
        'observability',
        'remote-service',
        'rest-api',
      ],
      implementations: [
        'complexipy',
        'deptry',
        'fastapi',
        'fastmcp',
        'httpx2',
        'hypothesis',
        'import-linter',
        'mutmut',
        'poe',
        'pydantic',
        'pytest',
        'python-check',
        'ruff',
        'structlog',
        'tombi',
        'ty',
        'uv',
        'vulture',
      ],
      languages: [
        'json',
        'python',
        'toml',
        'yaml',
      ],
      name: 'python',
    },
  },
  {
    name: 'docker',
    tools: [
      Tool.Hadolint,
      Tool.Dclint,
      Tool.Yamllint,
    ],
    unit: {
      implementations: [
        'compose',
        'dclint',
        'hadolint',
        'yamllint',
      ],
      languages: [
        'dockerfile',
        'yaml',
      ],
      name: 'docker',
    },
  },
];

/** The ids of every block the release holds, an abstract one aside, which a block extends. */
const releaseBlocks = (): readonly string[] =>
  [
    'domains',
    'contexts/platforms',
    'contexts/languages',
    'implementations',
  ]
    .flatMap((folder) => readdirSync(join(release, 'blocks', folder)))
    .filter((block) => !block.startsWith('_'))
    .toSorted((left, right) => left.localeCompare(right));

const listedBlocks = (): readonly string[] =>
  [
    ...new Set(
      deployedUnits.flatMap(({ unit }) => [
        ...(unit.domains ?? []),
        ...(unit.platforms ?? []),
        ...(unit.languages ?? []),
        ...(unit.implementations ?? []),
      ]),
    ),
  ].toSorted((left, right) => left.localeCompare(right));

const packageOf = (specifier: string): string => {
  const parts = specifier.split('/');

  return (specifier.startsWith(SCOPE) ? parts.slice(0, 2) : parts.slice(0, 1)).join('/');
};

const sourceFilesOf = (folder: string, path = ''): readonly string[] =>
  readdirSync(join(folder, path), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const relative = path === '' ? entry.name : `${path}/${entry.name}`;

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' || entry.name.startsWith('.')
        ? []
        : sourceFilesOf(folder, relative);
    }

    return SOURCE_FILE.test(entry.name)
      ? [
          relative,
        ]
      : [];
  });

const importedSpecifiers = (folder: string): readonly string[] =>
  [
    ...new Set(
      sourceFilesOf(folder).flatMap((path) =>
        [
          ...readFileSync(join(folder, path), 'utf8').matchAll(IMPORT),
        ]
          .map((match) => String(match[1]))
          .filter((specifier) => !specifier.startsWith(NODE_PREFIX) && specifier !== 'bun'),
      ),
    ),
  ].toSorted((left, right) => left.localeCompare(right));

const installedFolderOf = (name: string): string | undefined =>
  moduleFolders.map((folder) => join(folder, name)).find((path) => existsSync(path));

const writeFile = (path: string, text: string): void => {
  mkdirSync(dirname(path), {
    recursive: true,
  });
  writeFileSync(path, text);
};

const initRepository = (folder: string): void => {
  spawnSync(
    'git',
    [
      'init',
      '--quiet',
    ],
    {
      cwd: folder,
    },
  );
};

/** Its packages are linked from this repository's installs, or declared where none installs them. */
const writeProject = (input: { deployed: DeployedUnit; folder: string }): void => {
  const { deployed, folder } = input;
  const manifestPath = join(folder, 'package.json');
  const specifiers = importedSpecifiers(folder);
  const packages = [
    ...new Set(specifiers.map(packageOf)),
  ];
  const missing = specifiers.filter(
    (specifier) => installedFolderOf(packageOf(specifier)) === undefined,
  );

  if (existsSync(manifestPath)) {
    writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          name: deployed.name,
          ...JSON.parse(readFileSync(manifestPath, 'utf8')),
          devDependencies: Object.fromEntries(
            packages.map((name) => [
              name,
              '1.0.0',
            ]),
          ),
        },
        null,
        2,
      )}\n`,
    );
    writeFile(join(folder, 'src', 'unit.ts'), 'export const UNIT = 1;\n');

    for (const name of [
      ...packages,
      '@types/bun',
      'typescript',
    ]) {
      const installed = installedFolderOf(name);

      if (installed !== undefined && !existsSync(join(folder, 'node_modules', name))) {
        mkdirSync(dirname(join(folder, 'node_modules', name)), {
          recursive: true,
        });
        symlinkSync(installed, join(folder, 'node_modules', name));
      }
    }
  }

  if (missing.length > 0) {
    writeFile(
      join(folder, 'src', 'modules.d.ts'),
      missing.map((specifier) => `declare module '${specifier}';\n`).join(''),
    );
  }

  writeFile(join(folder, 'README.md'), `# ${deployed.name}\n\nA unit of every block.\n`);
  writeFile(
    join(folder, 'scripts', 'check.sh'),
    '#!/usr/bin/env bash\nset -euo pipefail\necho "checked"\n',
  );
  writeFile(join(folder, 'Dockerfile'), 'FROM alpine:3.22\nUSER 65534\nCMD ["true"]\n');
  writeFile(join(folder, 'compose.yaml'), 'services:\n  app:\n    image: alpine:3.22\n');
  writeFile(
    join(folder, 'constitution.yaml'),
    readFileSync(join(folder, 'constitution.yaml'), 'utf8')
      .replace(/^name: "(.*)"$/m, 'name: $1')
      .replace(/^(\w+): \[(.*)\]$/gm, (_line, key: string, items: string) =>
        items === ''
          ? `${key}: []`
          : `${key}:\n${items
              .split(', ')
              .map((listed) => `  - ${listed}`)
              .join('\n')}`,
      ),
  );
  initRepository(folder);
};

const commandsOf: Readonly<Record<Tool, readonly (readonly string[])[]>> = {
  [Tool.Betterleaks]: [
    [
      miseBinary('betterleaks'),
      'dir',
      '.',
      '--no-banner',
    ],
  ],
  [Tool.Biome]: [
    [
      bin('biome'),
      'check',
      '--error-on-warnings',
      '.',
    ],
  ],
  [Tool.Dclint]: [
    [
      bin('dclint'),
      'compose.yaml',
    ],
  ],
  [Tool.DependencyCruiser]: [
    [
      bin('depcruise'),
      'src/unit.ts',
      '--config',
      '.dependency-cruiser.jsonc',
    ],
  ],
  [Tool.Hadolint]: [
    [
      miseBinary('hadolint'),
      'Dockerfile',
    ],
  ],
  [Tool.Knip]: [
    [
      bin('knip'),
      '--no-exit-code',
      '--no-config-hints',
    ],
  ],
  [Tool.Lefthook]: [
    [
      miseBinary('lefthook'),
      'validate',
    ],
  ],
  [Tool.Ruff]: [
    [
      uvBinary('ruff'),
      'check',
      '.',
    ],
    [
      uvBinary('ruff'),
      'format',
      '--check',
      '.',
    ],
  ],
  [Tool.Rumdl]: [
    [
      miseBinary('rumdl'),
      'check',
      '.',
    ],
    [
      miseBinary('rumdl'),
      'fmt',
      '--check',
      '.',
    ],
  ],
  [Tool.Shellcheck]: [
    [
      miseBinary('shellcheck'),
      'scripts/check.sh',
    ],
  ],
  [Tool.Shfmt]: [
    [
      miseBinary('shfmt'),
      '-d',
      'scripts',
    ],
  ],
  [Tool.Syncpack]: [
    [
      bin('syncpack'),
      'lint',
    ],
  ],
  [Tool.Tombi]: [
    [
      miseBinary('tombi'),
      'format',
      '--check',
    ],
    [
      miseBinary('tombi'),
      'lint',
    ],
  ],
  [Tool.Tsc]: [
    [
      bin('tsc'),
      '-b',
    ],
  ],
  [Tool.Yamllint]: [
    [
      miseBinary('yamllint'),
      '--strict',
      '.',
    ],
  ],
};

const failuresOfRun = async (input: {
  command: readonly string[];
  folder: string;
  tool: Tool;
}): Promise<readonly Failure[]> => {
  const running = Bun.spawn(
    [
      ...input.command,
    ],
    {
      cwd: input.folder,
      env: Object.fromEntries([
        ...Object.entries(process.env),
        [
          'NO_COLOR',
          '1',
        ],
      ]),
      stderr: 'pipe',
      stdout: 'pipe',
    },
  );
  const [stdout, stderr, status] = await Promise.all([
    new Response(running.stdout).text(),
    new Response(running.stderr).text(),
    running.exited,
  ]);

  return status === 0
    ? []
    : [
        {
          output: `${input.command.join(' ')}\n${stdout}${stderr}`,
          tool: input.tool,
        },
      ];
};

const checkDeployed = async (deployed: DeployedUnit): Promise<readonly Failure[]> => {
  const folder = appliedUnit(deployed.unit);

  writeProject({
    deployed,
    folder,
  });

  // Biome runs first and alone: the others write caches, a compiler's declarations among them.
  const runsOf = (tools: readonly Tool[]): Promise<readonly (readonly Failure[])[]> =>
    Promise.all(
      tools.flatMap((tool) =>
        commandsOf[tool].map((command) =>
          failuresOfRun({
            command,
            folder,
            tool,
          }),
        ),
      ),
    );

  const first = await runsOf(deployed.tools.filter((tool) => tool === Tool.Biome));
  const rest = await runsOf(deployed.tools.filter((tool) => tool !== Tool.Biome));

  return [
    ...first,
    ...rest,
  ].flat();
};

export { checkDeployed, deployedUnits, listedBlocks, releaseBlocks };
