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
const PRESETS_FOLDER = join(REPOSITORY, 'presets');
const BLOCKS = join(REPOSITORY, 'blocks');

const FOUNDATION_PARTS = [
  'common/foundation/self',
  'typescript/foundation/self',
  'typescript/foundation/core',
  'typescript/foundation/typescript',
];

const PARTS: readonly string[] = [
  ...FOUNDATION_PARTS,
  'typescript/foundation/bun-test',
  'typescript/foundation/_react',
  'typescript/architecture/core',
  'typescript/architecture/typescript',
  'typescript/architecture/_react',
];

const writeFiles = (folder: string, files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

// .droneey/constitution is a folder of its own, so a case can put a file beside the
// presets it links.
const inProject = <T>(project: Project, run: (folder: string) => T): T => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  mkdirSync(join(folder, '.droneey', 'constitution'), {
    recursive: true,
  });
  symlinkSync(join(REPOSITORY, 'presets'), join(folder, '.droneey/constitution', 'presets'));
  writeFiles(folder, {
    ...project.files,
    'biome.json': JSON.stringify({
      extends: (project.parts ?? PARTS).map(
        (part) => `./.droneey/constitution/presets/${part.replace('/', '/biome/')}.jsonc`,
      ),
      vcs: {
        enabled: false,
      },
    }),
  });

  const outcome = run(folder);

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return outcome;
};

const lintFindings = (project: Project): Findings => {
  const linting = inProject(project, (folder) =>
    spawnSync(
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
    ),
  );
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

// Biome rewrites the file in place; the case reads back what it wrote.
const formattedText = (source: string): string =>
  inProject(
    {
      files: {
        'src/order.ts': source,
      },
      parts: FOUNDATION_PARTS,
    },
    (folder) => {
      spawnSync(
        BIOME,
        [
          'format',
          '--write',
          'src',
        ],
        {
          cwd: folder,
          encoding: 'utf8',
        },
      );

      return readFileSync(join(folder, 'src', 'order.ts'), 'utf8');
    },
  );

const presetFiles = (): readonly string[] =>
  readdirSync(PRESETS_FOLDER, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.split('/')[1] === 'biome' && path.endsWith('.jsonc'))
    .toSorted((left, right) => left.localeCompare(right));

const presetText = (path: string): string => readFileSync(join(PRESETS_FOLDER, path), 'utf8');

const presetWords = (): readonly string[] => {
  const segments = presetFiles()
    .flatMap((path) => PRESET.parse(Bun.JSONC.parse(presetText(path))).plugins ?? [])
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
  formattedText,
  lintFindings,
  presetFiles,
  presetText,
  presetWords,
};
