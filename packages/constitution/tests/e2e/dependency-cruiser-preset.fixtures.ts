import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { cruise as cruiseModules } from 'dependency-cruiser';
import extractDepcruiseConfig from 'dependency-cruiser/config-utl/extract-depcruise-config';
import { z } from 'zod';

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
  files: Readonly<Record<string, string>>;
  // A link's path, then the folder it points to, as a package manager links a workspace's units.
  links?: Readonly<Record<string, string>>;
  // The project's own settings, joined after the parts.
  own?: Readonly<Record<string, unknown>>;
  parts?: readonly string[];
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

const repository = join(import.meta.dir, '..', '..');

const baseParts = [
  'typescript/self',
  'typescript/core',
  'typescript/typescript',
];

// The packages the blocks' rules name, and those the parts of the base tell
// apart: `kit` declared, `devtool` a development dependency, `ghost` installed
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

const template = readFileSync(
  join(
    repository,
    'templates',
    'project',
    'typescript',
    'dependency-cruiser',
    '.dependency-cruiser.mjs',
  ),
  'utf8',
);

// The template written for the parts at these paths, as /constitution:ratify writes it: one
// namespace import to a part, and the parts joined in their order by the release's join.
const configFromTemplate = (
  paths: readonly string[],
  presets = './.droneey/constitution/presets',
): string => {
  const names = paths.map((_, index) => `part${String(index)}`);

  return template
    .replace('<presets>', presets)
    .replace(
      "import * as part from '<parts>';",
      paths.map((path, index) => `import * as ${names[index] ?? ''} from '${path}';`).join('\n'),
    )
    .replace('  part,\n', names.map((name) => `  ${name},\n`).join(''));
};

const configOf = (parts: readonly string[], own: Readonly<Record<string, unknown>> = {}): string =>
  configFromTemplate(
    [
      ...baseParts,
      ...parts,
    ].map(
      (part) =>
        `./.droneey/constitution/presets/${part.replace('/', '/dependency-cruiser/').replace(/\/dependency-cruiser\/(?!architecture\/|workflow\/)/, '/dependency-cruiser/foundation/')}.mjs`,
    ),
  ).replace('  {},\n', `  ${JSON.stringify(own)},\n`);

const writeProject = (folder: string, project: Project): void => {
  const files = {
    ...installedFiles(),
    ...project.files,
    '.dependency-cruiser.mjs': configOf(
      project.parts ?? [
        'typescript/architecture/core',
      ],
      project.own,
    ),
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

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(repository, join(folder, '.droneey', 'constitution'));
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

  writeProject(folder, project);
  process.chdir(folder);

  try {
    const cruising = await cruiseModules(
      [
        ...(project.roots ?? [
          'src',
        ]),
      ],
      {
        outputType: 'json',
        ruleSet: await extractDepcruiseConfig('./.dependency-cruiser.mjs'),
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

export { configFromTemplate, cruise };
