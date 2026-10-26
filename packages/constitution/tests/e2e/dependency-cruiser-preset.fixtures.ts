import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { cruise as cruiseModules } from 'dependency-cruiser';
import extractDepcruiseConfig from 'dependency-cruiser/config-utl/extract-depcruise-config';
import { z } from 'zod';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit } from './applied-unit.fixtures';

enum Declaration {
  Production = 'production',
  Development = 'development',
  Both = 'both',
  PeerAndDevelopment = 'peer-and-development',
  None = 'none',
}

interface Installed {
  declaration: Declaration;
  deprecated?: string;
}

interface Project {
  /** the optional axes the unit follows; architecture and workflow where it names none */
  axes?: readonly string[];
  /** the blocks of the unit beside its language's and dependency-cruiser */
  blocks?: readonly string[];
  files: Readonly<Record<string, string>>;
  // A link's path, then the folder it points to, as a package manager links a workspace's units.
  links?: Readonly<Record<string, string>>;
  /** the text of the unit's own preset file of dependency-cruiser, in a pack of its own */
  own?: string;
  roots?: readonly string[];
  workspaces?: readonly string[];
}

interface Cruise {
  cruised: number;
  violations: readonly string[];
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

// The packages the blocks' rules name, and those the base's rules tell apart: `kit` declared, `devtool` a development dependency, `ghost` installed
// but never declared, `legacy` deprecated.
const INSTALLED: Readonly<Record<string, Installed>> = {
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
} as const;

const installedFiles = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(INSTALLED).flatMap(([name, { deprecated }]) => [
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
    Object.entries(INSTALLED)
      .filter(([, installed]) => declarations.includes(installed.declaration))
      .map(([name]) => [
        name,
        '1.0.0',
      ]),
  );

const CONFIG = '.dependency-cruiser.json';
const OWN_PACK = 'pack';

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
  ...(project.own === undefined
    ? {}
    : {
        files: {
          [`${OWN_PACK}/presets/dependency-cruiser/foundation.yaml`]: project.own,
        },
        packs: [
          OWN_PACK,
        ],
      }),
});

const configOf = (project: Project): string =>
  readFileSync(join(appliedUnit(unitOf(project)), CONFIG), 'utf8');

const writeProject = (folder: string, project: Project): void => {
  const files = {
    ...installedFiles(),
    ...project.files,
    [CONFIG]: configOf(project),
    'package.json': JSON.stringify({
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
      peerDependencies: declared([
        Declaration.PeerAndDevelopment,
      ]),
      type: 'module',
      workspaces: project.workspaces,
    }),
  };

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  for (const [path, target] of Object.entries(project.links ?? {})) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    symlinkSync(join(folder, target), join(folder, path));
  }
};

// The json reporter's output is the text of the result.
const cruiseOf = (output: unknown): Cruise => {
  const { summary } = report.parse(JSON.parse(String(output)));

  return {
    cruised: summary.totalCruised,
    violations: [
      ...new Set(summary.violations.map(({ rule }) => rule.name)),
    ],
  };
};

// dependency-cruiser runs in the spec's process, as its command line runs it: it resolves the
// configuration and the modules from the working folder, so the cruise holds the process there.
const cruise = async (project: Project): Promise<Cruise> => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-depcruise-'));
  const workingFolder = process.cwd();

  try {
    writeProject(folder, project);
    process.chdir(folder);

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

export { cruise };
