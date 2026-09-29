import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

enum Declaration {
  Production = 'production',
  Development = 'development',
  None = 'none',
}

interface Installed {
  declaration: Declaration;
  deprecated?: string;
}

interface Project {
  files: Readonly<Record<string, string>>;
  parts?: readonly string[];
  roots?: readonly string[];
}

interface Cruise {
  cruised: number;
  violations: readonly string[];
}

const REPORT = z.object({
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

const REPOSITORY = join(import.meta.dir, '..', '..');
const DEPCRUISE = join(REPOSITORY, 'node_modules', '.bin', 'depcruise');

const FOUNDATION_PARTS = [
  'foundation/self',
  'foundation/typescript',
];

// The packages the blocks' rules name, and those the foundation parts tell
// apart: `kit` declared, `devtool` a development dependency, `ghost` installed
// but never declared, `legacy` deprecated.
const INSTALLED: Readonly<Record<string, Installed>> = {
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
  ghost: {
    declaration: Declaration.None,
  },
  kit: {
    declaration: Declaration.Production,
  },
  ky: {
    declaration: Declaration.Production,
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

const declared = (declaration: Declaration): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries(INSTALLED)
      .filter(([, installed]) => installed.declaration === declaration)
      .map(([name]) => [
        name,
        '1.0.0',
      ]),
  );

const configOf = (parts: readonly string[]): string =>
  `export default {\n  extends: ${JSON.stringify(
    [
      ...FOUNDATION_PARTS,
      ...parts,
    ].map((part) => `./.constitution/presets/dependency-cruiser/${part}.mjs`),
  )},\n};\n`;

const cruise = (project: Project): Cruise => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-depcruise-'));
  const files = {
    ...installedFiles(),
    ...project.files,
    '.dependency-cruiser.mjs': configOf(
      project.parts ?? [
        'architecture/core',
      ],
    ),
    'package.json': JSON.stringify({
      dependencies: declared(Declaration.Production),
      devDependencies: declared(Declaration.Development),
      name: 'fixture',
      type: 'module',
    }),
  };

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  symlinkSync(REPOSITORY, join(folder, '.constitution'));

  const cruising = spawnSync(
    DEPCRUISE,
    [
      ...(project.roots ?? [
        'src',
      ]),
      '--config',
      '.dependency-cruiser.mjs',
      '--output-type',
      'json',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  const { summary } = REPORT.parse(JSON.parse(cruising.stdout));

  return {
    cruised: summary.totalCruised,
    violations: [
      ...new Set(summary.violations.map(({ rule }) => rule.name)),
    ],
  };
};

export { cruise };
