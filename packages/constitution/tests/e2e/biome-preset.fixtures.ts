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

const report = z.object({
  diagnostics: z.array(
    z.object({
      category: z.string(),
      message: z.string(),
    }),
  ),
});

const preset = z.object({
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

const repository = join(import.meta.dir, '..', '..');
const biome = join(repository, 'node_modules', '.bin', 'biome');
const presetsFolder = join(repository, 'presets');
const blocks = join(repository, 'blocks');

const baseParts = [
  'common/self',
  'typescript/self',
  'typescript/core',
  'typescript/typescript',
];

const PARTS: readonly string[] = [
  ...baseParts,
  'typescript/bun-test',
  'typescript/_react',
  'typescript/architecture/core',
  'typescript/architecture/typescript',
] as const;

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
  symlinkSync(join(repository, 'presets'), join(folder, '.droneey/constitution', 'presets'));
  writeFiles(folder, {
    ...project.files,
    'biome.json': JSON.stringify({
      extends: (project.parts ?? PARTS).map(
        (part) =>
          `./.droneey/constitution/presets/${part.replace('/', '/biome/').replace(/\/biome\/(?!architecture\/|workflow\/)/, '/biome/foundation/')}.jsonc`,
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
      biome,
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
  const { diagnostics } = report.parse(JSON.parse(linting.stdout));

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
      parts: baseParts,
    },
    (folder) => {
      spawnSync(
        biome,
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
  readdirSync(presetsFolder, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.split('/')[1] === 'biome' && path.endsWith('.jsonc'))
    .toSorted((left, right) => left.localeCompare(right));

const presetText = (path: string): string => readFileSync(join(presetsFolder, path), 'utf8');

const presetWords = (): readonly string[] => {
  const segments = presetFiles()
    .flatMap((path) => preset.parse(Bun.JSONC.parse(presetText(path))).plugins ?? [])
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
  readdirSync(blocks, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith('.md'))
    .map((path) => readFileSync(join(blocks, path), 'utf8'))
    .flatMap((text) => [
      ...text.matchAll(/`([^`\n]+)`|"([^"\n]+)"/g),
    ])
    .map(([, code, quoted]) => code ?? quoted ?? '');

export { baseParts, blockCode, formattedText, lintFindings, presetFiles, presetText, presetWords };
