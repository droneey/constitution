import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Report {
  diagnostics: readonly {
    category: string;
    message: string;
  }[];
}

interface Preset {
  plugins: readonly (
    | string
    | {
        includes: readonly string[];
      }
  )[];
}

interface Project {
  files: Readonly<Record<string, string>>;
  parts?: readonly string[];
}

interface Findings {
  plugins: readonly string[];
  rules: readonly string[];
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const BIOME = join(REPOSITORY, 'node_modules', '.bin', 'biome');
const PRESETS_FOLDER = join(REPOSITORY, 'presets', 'biome');
const BLOCKS = join(REPOSITORY, 'blocks');

const DEVKIT_PRESETS = [
  '@droneey/devkit-ts-biome/base',
  '@droneey/devkit-ts-biome/test',
];

const PARTS = [
  'base',
  'bun-test',
  'react',
];

const linkDevkit = (folder: string): void => {
  symlinkSync(
    join(REPOSITORY, 'node_modules', '@droneey', 'devkit-ts-biome'),
    join(folder, 'node_modules', '@droneey', 'devkit-ts-biome'),
  );
};

const lintFindings = (project: Project): Findings => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  mkdirSync(join(folder, 'node_modules', '@droneey'), {
    recursive: true,
  });
  linkDevkit(folder);
  symlinkSync(REPOSITORY, join(folder, '.constitution'));
  writeFileSync(
    join(folder, 'biome.json'),
    JSON.stringify({
      extends: [
        ...DEVKIT_PRESETS,
        ...(project.parts ?? PARTS).map(
          (part) => `./.constitution/presets/biome/${part}.jsonc`,
        ),
      ],
      vcs: {
        enabled: false,
      },
    }),
  );

  for (const [path, text] of Object.entries(project.files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  const linting = spawnSync(
    BIOME,
    [
      'lint',
      '--reporter=json',
      'src',
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

  const report = JSON.parse(linting.stdout) as Report;

  return {
    plugins: report.diagnostics
      .filter(({ category }) => category === 'plugin')
      .map(({ message }) => message),
    rules: report.diagnostics
      .filter(({ category }) => category !== 'plugin')
      .map(({ category }) => category.slice(category.lastIndexOf('/') + 1)),
  };
};

const presetWords = (): readonly string[] => {
  const presets = readdirSync(PRESETS_FOLDER)
    .filter((name) => name.endsWith('.jsonc'))
    .map(
      (name) =>
        Bun.JSONC.parse(
          readFileSync(join(PRESETS_FOLDER, name), 'utf8'),
        ) as Preset,
    );
  const segments = presets
    .flatMap(({ plugins }) => plugins)
    .flatMap((plugin) => (typeof plugin === 'string' ? [] : plugin.includes))
    .flatMap((glob) => glob.replace(/^!/, '').split('/'))
    .filter((segment) => segment !== '**')
    .map((segment) => segment.replace(/^\*/, ''));

  return [
    ...new Set(segments),
  ];
};

// What the blocks write as code — in backticks, or in a block's `governs`.
const blockCode = (): readonly string[] =>
  readdirSync(BLOCKS, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('.md'))
    .map((path) => readFileSync(join(BLOCKS, path), 'utf8'))
    .flatMap((text) => [
      ...text.matchAll(/`([^`\n]+)`|"([^"\n]+)"/g),
    ])
    .map(([, code, quoted]) => code ?? quoted ?? '');

export type { Findings, Project };
export { blockCode, lintFindings, presetWords };
