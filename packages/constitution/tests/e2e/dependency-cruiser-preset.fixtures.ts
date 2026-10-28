import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { cruise as cruiseModules } from 'dependency-cruiser';
import extractDepcruiseConfig from 'dependency-cruiser/config-utl/extract-depcruise-config';
import { z } from 'zod';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit, constitutionOf } from './applied-unit.fixtures';
import { release, writeFiles } from './package.fixtures';
import { OWN_PACK } from './project.fixtures';

enum Declaration {
  Production = 'production',
  Development = 'development',
  Both = 'both',
  PeerAndDevelopment = 'peer-and-development',
  None = 'none',
}

interface Installed {
  readonly declaration: Declaration;
  readonly deprecated?: string;
}

interface Project {
  readonly axes?: readonly string[];
  readonly blocks?: readonly string[];
  readonly files: Readonly<Record<string, string>>;
  readonly links?: Readonly<Record<string, string>>;
  readonly own?: string;
  readonly roots?: readonly string[];
  readonly unit?: string;
  readonly workspaces?: readonly string[];
}

interface Cruise {
  readonly isCruised: boolean;
  readonly violations: readonly string[];
}

const report = z.object({
  summary: z.object({
    totalCruised: z.number(),
    violations: z.array(
      z.object({
        rule: z.object({
          name: z.string(),
        }),
      }),
    ),
  }),
});

const installedPackages: Readonly<Record<string, Installed>> = {
  '@bunli/core': {
    declaration: Declaration.Production,
  },
  '@lingui/core': {
    declaration: Declaration.Production,
  },
  '@tanstack/react-query': {
    declaration: Declaration.Production,
  },
  '@tanstack/react-router': {
    declaration: Declaration.Production,
  },
  devtool: {
    declaration: Declaration.Development,
  },
  'expo-router': {
    declaration: Declaration.Production,
  },
  ghost: {
    declaration: Declaration.None,
  },
  inversify: {
    declaration: Declaration.Production,
  },
  kit: {
    declaration: Declaration.Production,
  },
  ky: {
    declaration: Declaration.Production,
  },
  pino: {
    declaration: Declaration.Production,
  },
  react: {
    declaration: Declaration.Production,
  },
  doubled: {
    declaration: Declaration.Both,
  },
  configured: {
    declaration: Declaration.PeerAndDevelopment,
  },
  legacy: {
    declaration: Declaration.Production,
    deprecated: 'use kit',
  },
  yaml: {
    declaration: Declaration.Production,
  },
  zod: {
    declaration: Declaration.Production,
  },
};

const installedFiles = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(installedPackages).flatMap(([name, { deprecated }]) => [
      [
        `node_modules/${name}/index.js`,
        'export const value = 1;\n',
      ],
      [
        `node_modules/${name}/package.json`,
        JSON.stringify({
          deprecated,
          main: 'index.js',
          name,
          version: '1.0.0',
        }),
      ],
    ]),
  );

const declared = (declarations: readonly Declaration[]): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(installedPackages)
      .filter(([, installed]) => declarations.includes(installed.declaration))
      .map(([name]) => [
        name,
        '1.0.0',
      ]),
  );

const CONFIG = '.dependency-cruiser.jsonc';
const MANIFEST = 'package.json';
const CONSTITUTION = 'constitution.yaml';
const presetsFolder = join(release, 'presets', 'dependency-cruiser');
const RULE_NAME = /forbidden\[name=([^\]]+)\]/g;

const unitOf = (project: Project): UnitFixture => ({
  ...(project.axes === undefined
    ? {}
    : {
        axes: project.axes,
      }),
  blocks: project.blocks ?? [],
  implementations: [
    'dependency-cruiser',
  ],
  languages: [
    'typescript',
  ],
});

const workspaceFilesOf = (project: Project): Readonly<Record<string, string>> =>
  project.workspaces === undefined
    ? {}
    : {
        [MANIFEST]: JSON.stringify({
          name: 'fixture',
          workspaces: project.workspaces,
        }),
        ...Object.fromEntries(
          Object.values(project.links ?? {}).flatMap((folder) => [
            [
              join(folder, MANIFEST),
              project.files[join(folder, MANIFEST)] ?? '{}',
            ],
            [
              join(folder, CONSTITUTION),
              constitutionOf({
                ...unitOf(project),
                name: basename(folder),
              }),
            ],
          ]),
        ),
      };

const appliedFilesOf = (project: Project): Partial<UnitFixture> =>
  project.own === undefined
    ? {
        files: workspaceFilesOf(project),
      }
    : {
        files: {
          ...workspaceFilesOf(project),
          [`${OWN_PACK}/presets/dependency-cruiser/foundation.yaml`]: project.own,
        },
        packs: [
          OWN_PACK,
        ],
      };

const configOf = (project: Project): string =>
  readFileSync(
    join(
      appliedUnit({
        ...unitOf(project),
        ...appliedFilesOf(project),
      }),
      project.unit ?? '',
      CONFIG,
    ),
    'utf8',
  );

const writeProject = (folder: string, project: Project): void => {
  writeFiles({
    files: {
      ...installedFiles(),
      ...project.files,
      [join(project.unit ?? '', CONFIG)]: configOf(project),
      [MANIFEST]: JSON.stringify({
        dependencies: declared([
          Declaration.Production,
          Declaration.Both,
        ]),
        devDependencies: declared([
          Declaration.Development,
          Declaration.Both,
          Declaration.PeerAndDevelopment,
        ]),
        name: 'fixture',
        imports: {
          '#/*': './src/*',
        },
        peerDependencies: declared([
          Declaration.PeerAndDevelopment,
        ]),
        type: 'module',
        workspaces: project.workspaces,
      }),
    },
    folder,
  });

  for (const [path, target] of Object.entries(project.links ?? {})) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    symlinkSync(join(folder, target), join(folder, path));
  }
};

const cruiseOf = (output: unknown): Cruise => {
  const { summary } = report.parse(JSON.parse(String(output)));

  return {
    isCruised: summary.totalCruised > 0,
    violations: [
      ...new Set(summary.violations.map(({ rule }) => rule.name)),
    ],
  };
};

// Why: dependency-cruiser resolves the configuration and the modules from the working folder, as
// its command line does, so the cruise holds the process there.
const cruise = async (project: Project): Promise<Cruise> => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-depcruise-'));
  const workingFolder = process.cwd();

  try {
    writeProject(folder, project);
    process.chdir(join(folder, project.unit ?? ''));

    const cruising = await cruiseModules(
      [
        ...(project.roots ?? [
          'src',
        ]),
      ],
      {
        outputType: 'json',
        ruleSet: await extractDepcruiseConfig(`./${CONFIG}`),
        validate: true,
      },
      {},
      {
        babelConfig: {},
        tsConfig: {},
      },
    );

    return cruiseOf(cruising.output);
  } finally {
    process.chdir(workingFolder);
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const presetRuleNames = (): readonly string[] => [
  ...new Set(
    readdirSync(presetsFolder, {
      recursive: true,
    })
      .map(String)
      .filter((path) => path.endsWith('.yaml'))
      .flatMap((path) =>
        [
          ...readFileSync(join(presetsFolder, path), 'utf8').matchAll(RULE_NAME),
        ].map(([, name]) => String(name)),
      ),
  ),
];

const rulesNamedByNoRow = (
  rows: readonly {
    readonly rule: string;
  }[],
): readonly string[] => presetRuleNames().filter((name) => !rows.some(({ rule }) => rule === name));

export { cruise, rulesNamedByNoRow };
