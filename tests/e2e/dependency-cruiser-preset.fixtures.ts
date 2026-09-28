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

interface Report {
  summary: {
    totalCruised: number;
    violations: readonly {
      rule: {
        name: string;
      };
    }[];
  };
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

const REPOSITORY = join(import.meta.dir, '..', '..');
const DEPCRUISE = join(REPOSITORY, 'node_modules', '.bin', 'depcruise');

const INSTALLED = [
  '@lingui/core',
  '@tanstack/react-query',
  '@tanstack/react-router',
  'ky',
  'yaml',
  'zod',
];

// The packages the blocks' rules name, installed and declared, so hygiene
// stays silent about them.
const installedFiles = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    INSTALLED.flatMap((name) => [
      [
        `node_modules/${name}/index.js`,
        'export const value = 1;\n',
      ],
      [
        `node_modules/${name}/package.json`,
        JSON.stringify({
          main: 'index.js',
          name,
          version: '1.0.0',
        }),
      ],
    ]),
  );

const configOf = (parts: readonly string[]): string =>
  `export default {\n  extends: ${JSON.stringify([
    '@droneey/devkit-ts-dependency-cruiser/configs/hygiene.mjs',
    ...parts.map(
      (part) => `./.constitution/presets/dependency-cruiser/${part}.mjs`,
    ),
  ])},\n};\n`;

const cruise = (project: Project): Cruise => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-depcruise-'));
  const files = {
    ...installedFiles(),
    ...project.files,
    '.dependency-cruiser.mjs': configOf(
      project.parts ?? [
        'base',
      ],
    ),
    'package.json': JSON.stringify({
      dependencies: Object.fromEntries(
        INSTALLED.map((name) => [
          name,
          '1.0.0',
        ]),
      ),
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
  mkdirSync(join(folder, 'node_modules', '@droneey'), {
    recursive: true,
  });
  symlinkSync(
    join(
      REPOSITORY,
      'node_modules',
      '@droneey',
      'devkit-ts-dependency-cruiser',
    ),
    join(folder, 'node_modules', '@droneey', 'devkit-ts-dependency-cruiser'),
  );

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

  const report = JSON.parse(cruising.stdout) as Report;

  return {
    cruised: report.summary.totalCruised,
    violations: [
      ...new Set(report.summary.violations.map(({ rule }) => rule.name)),
    ],
  };
};

export { cruise };
