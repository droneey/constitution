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

import { z } from 'zod';

interface Project {
  files: Readonly<Record<string, string>>;
  parts?: readonly string[];
}

interface Findings {
  plugins: readonly string[];
  rules: readonly string[];
}

const REPORT = z.object({
  diagnostics: z.array(
    z.object({
      category: z.string(),
      message: z.string(),
    }),
  ),
});

const PRESET = z.object({
  plugins: z
    .array(
      z.union([
        z.string(),
        z.object({
          includes: z.array(z.string()),
        }),
      ]),
    )
    .optional(),
});

const REPOSITORY = join(import.meta.dir, '..', '..');
const BIOME = join(REPOSITORY, 'node_modules', '.bin', 'biome');
const PRESETS_FOLDER = join(REPOSITORY, 'presets', 'biome');
const BLOCKS = join(REPOSITORY, 'blocks');

const FOUNDATION_PARTS = [
  'foundation/self',
  'foundation/core',
  'foundation/typescript',
];

const PARTS: readonly string[] = [
  ...FOUNDATION_PARTS,
  'foundation/bun-test',
  'foundation/_react',
  'architecture/core',
  'architecture/typescript',
  'architecture/_react',
];

const writeFiles = (
  folder: string,
  files: Readonly<Record<string, string>>,
): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

// .constitution is a folder of its own, so a case can put a file beside the
// presets it links.
const lintFindings = (project: Project): Findings => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  mkdirSync(join(folder, '.constitution'));
  symlinkSync(
    join(REPOSITORY, 'presets'),
    join(folder, '.constitution', 'presets'),
  );
  writeFiles(folder, {
    ...project.files,
    'biome.json': JSON.stringify({
      extends: (project.parts ?? PARTS).map(
        (part) => `./.constitution/presets/biome/${part}.jsonc`,
      ),
      vcs: {
        enabled: false,
      },
    }),
  });

  const linting = spawnSync(
    BIOME,
    [
      'lint',
      '--reporter=json',
      '.',
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

  const { diagnostics } = REPORT.parse(JSON.parse(linting.stdout));

  return {
    plugins: diagnostics
      .filter(({ category }) => category === 'plugin')
      .map(({ message }) => message),
    rules: diagnostics
      .filter(({ category }) => category !== 'plugin')
      .map(({ category }) => category.slice(category.lastIndexOf('/') + 1)),
  };
};

const presetFiles = (): readonly string[] =>
  readdirSync(PRESETS_FOLDER, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('.jsonc'))
    .toSorted((left, right) => left.localeCompare(right));

const presetText = (path: string): string =>
  readFileSync(join(PRESETS_FOLDER, path), 'utf8');

const presetWords = (): readonly string[] => {
  const segments = presetFiles()
    .flatMap(
      (path) => PRESET.parse(Bun.JSONC.parse(presetText(path))).plugins ?? [],
    )
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

export {
  blockCode,
  FOUNDATION_PARTS,
  lintFindings,
  presetFiles,
  presetText,
  presetWords,
};
