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

import { parse } from 'yaml';
import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Project {
  parts?: readonly string[];
  paths: readonly string[];
}

const PRESET = z.object({
  ls: z.record(z.string(), z.unknown()).default({}),
});

const REPOSITORY = join(import.meta.dir, '..', '..');
const PRESETS_FOLDER = join(REPOSITORY, 'presets');

const PARTS = [
  'common/foundation/core',
  'typescript/foundation/typescript',
  'typescript/architecture/core',
];

const LS_LINT = miseBinary('ls-lint');

const failedPaths = (project: Project): readonly string[] => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-ls-lint-'));

  for (const path of project.paths) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), '');
  }

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));

  const linting = spawnSync(
    LS_LINT,
    [
      'common/foundation/self',
      ...(project.parts ?? PARTS),
    ].flatMap((part) => [
      '--config',
      `.droneey/constitution/presets/${part.replace('/', '/ls-lint/')}.yaml`,
    ]),
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  const output = `${linting.stdout}${linting.stderr}`;
  const failed = output
    .split('\n')
    .filter((line) => line.includes(' failed for '))
    .map((line) => line.slice(0, line.indexOf(' failed for ')));

  if (linting.status !== 0 && failed.length === 0) {
    throw new Error(`ls-lint did not run: ${output}`);
  }

  return failed;
};

const isRecord = (node: unknown): node is Readonly<Record<string, unknown>> =>
  typeof node === 'object' && node !== null && !Array.isArray(node);

const keysOf = (tree: Readonly<Record<string, unknown>>): readonly string[] =>
  Object.entries(tree).flatMap(([key, node]) =>
    isRecord(node)
      ? [
          key,
          ...keysOf(node),
        ]
      : [
          key,
        ],
  );

const valuesOf = (tree: Readonly<Record<string, unknown>>): readonly string[] =>
  Object.values(tree).flatMap((node) =>
    isRecord(node)
      ? valuesOf(node)
      : [
          String(node),
        ],
  );

const presetWords = (): readonly string[] => {
  const presets = readdirSync(PRESETS_FOLDER, {
    recursive: true,
  })
    .map(String)
    // bindings.yaml names rules, not what the blocks write.
    .filter(
      (path) =>
        path.split('/')[1] === 'ls-lint' &&
        path.endsWith('.yaml') &&
        !path.endsWith('/bindings.yaml'),
    )
    .map((path) =>
      PRESET.parse(
        parse(readFileSync(join(PRESETS_FOLDER, path), 'utf8'), {
          merge: true,
        }),
      ),
    );
  const folders = presets
    .flatMap(({ ls }) => keysOf(ls))
    .filter((key) => !key.startsWith('.'))
    .flatMap((key) => key.split('/'))
    .flatMap((segment) => segment.replace(/^\{|\}$/g, '').split(','));
  const suffixes = presets
    .flatMap(({ ls }) => keysOf(ls))
    .filter((key) => key.startsWith('.') && key !== '.dir')
    .map((key) =>
      key
        .replace(/\.tsx?$/, '')
        .split('.')
        .filter((segment) => segment !== '' && segment !== '*')
        .map((segment) => `.${segment}`)
        .join(''),
    );
  const alternatives = presets
    .flatMap(({ ls }) => valuesOf(ls))
    // ls-lint separates a key's rules by ` | `; a bare `|` stays in a regex.
    .flatMap((rules) => rules.split(' | '))
    .filter((rule) => rule.startsWith('regex:'))
    .flatMap((rule) => rule.replace(/^regex:\^\(?|\)?\$$/g, '').split('|'));

  return [
    ...new Set(
      [
        ...folders,
        ...suffixes,
        ...alternatives,
      ].filter((word) => /^\.?[\w-]+$/.test(word)),
    ),
  ];
};

export { failedPaths, PARTS, presetWords };
