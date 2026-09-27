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
  plugins: readonly {
    includes: readonly string[];
  }[];
}

interface Project {
  files: Readonly<Record<string, string>>;
}

interface Findings {
  plugins: readonly string[];
  rules: readonly string[];
}

const REPOSITORY = join(import.meta.dir, '..', '..', '..');
const BIOME = join(REPOSITORY, 'node_modules', '.bin', 'biome');
const PRESET = join(REPOSITORY, 'presets', 'biome', 'constitution.jsonc');
const BLOCKS = join(REPOSITORY, 'blocks');

const PRESETS = [
  '@droneey/devkit-ts-biome/base',
  '@droneey/devkit-ts-biome/test',
  '@droneey/constitution/biome',
];

const linkPackage = (input: { folder: string; name: string }): void => {
  symlinkSync(
    input.name === 'constitution'
      ? REPOSITORY
      : join(REPOSITORY, 'node_modules', '@droneey', input.name),
    join(input.folder, 'node_modules', '@droneey', input.name),
  );
};

// What the real Biome reports over a small project that installs devkit's
// general presets and this repository's preset and extends them by name, as a
// consumer does: each lint rule by its name, each GritQL plugin by its message.
const lintFindings = (project: Project): Findings => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  mkdirSync(join(folder, 'node_modules', '@droneey'), {
    recursive: true,
  });
  linkPackage({
    folder,
    name: 'constitution',
  });
  linkPackage({
    folder,
    name: 'devkit-ts-biome',
  });
  writeFileSync(
    join(folder, 'biome.json'),
    JSON.stringify({
      extends: PRESETS,
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

// Each folder, file and suffix the preset's plugins are scoped by:
// `!**/src/libs/**` names `src` and `libs`, `**/*.hooks.ts` names `.hooks.ts`.
const presetWords = (): readonly string[] => {
  const preset = Bun.JSONC.parse(readFileSync(PRESET, 'utf8')) as Preset;
  const segments = preset.plugins
    .flatMap(({ includes }) => includes)
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
