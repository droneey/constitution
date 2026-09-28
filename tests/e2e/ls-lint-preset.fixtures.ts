import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { parse } from 'yaml';

interface Project {
  parts?: readonly string[];
  paths: readonly string[];
}

interface Preset {
  ignore?: readonly string[];
  ls: Readonly<Record<string, unknown>>;
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const PRESETS_FOLDER = join(REPOSITORY, 'presets', 'ls-lint');

const DEVKIT_PARTS = [
  'base',
  'markdown',
  'typescript',
];

// mise pins ls-lint for this repository; its shim does not resolve in a
// temporary folder, so the check runs the binary it points to.
const LS_LINT = spawnSync(
  'mise',
  [
    'which',
    'ls-lint',
  ],
  {
    cwd: REPOSITORY,
    encoding: 'utf8',
  },
).stdout.trim();

if (LS_LINT === '') {
  throw new Error(
    'ls-lint is not installed: run `mise install` in a trusted checkout',
  );
}

const failedPaths = (project: Project): readonly string[] => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-ls-lint-'));

  for (const path of project.paths) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), '');
  }

  symlinkSync(
    realpathSync(join(REPOSITORY, '.devkit')),
    join(folder, '.devkit'),
  );
  symlinkSync(REPOSITORY, join(folder, '.constitution'));

  const linting = spawnSync(
    LS_LINT,
    [
      ...DEVKIT_PARTS.map((part) => `.devkit/common/ls-lint/${part}.yaml`),
      ...(
        project.parts ?? [
          'base',
        ]
      ).map((part) => `.constitution/presets/ls-lint/${part}.yaml`),
    ].flatMap((config) => [
      '--config',
      config,
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

const keysOf = (tree: Readonly<Record<string, unknown>>): readonly string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? [
          key,
          ...keysOf(value as Record<string, unknown>),
        ]
      : [
          key,
        ],
  );

const valuesOf = (tree: Readonly<Record<string, unknown>>): readonly string[] =>
  Object.values(tree).flatMap((value) =>
    typeof value === 'object' && value !== null
      ? valuesOf(value as Record<string, unknown>)
      : [
          String(value),
        ],
  );

const presetWords = (): readonly string[] => {
  const presets = readdirSync(PRESETS_FOLDER)
    .filter((name) => name.endsWith('.yaml'))
    .map(
      (name) =>
        parse(readFileSync(join(PRESETS_FOLDER, name), 'utf8'), {
          merge: true,
        }) as Preset,
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
  const ignored = presets.flatMap(({ ignore }) => ignore ?? []);

  return [
    ...new Set(
      [
        ...folders,
        ...suffixes,
        ...alternatives,
        ...ignored,
      ].filter((word) => /^\.?[\w-]+$/.test(word)),
    ),
  ];
};

export { failedPaths, presetWords };
