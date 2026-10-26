import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { cliPath } from './cli.fixtures';

interface UnitFixture {
  /** the optional axes it follows; architecture and workflow where it names none */
  readonly axes?: readonly string[];
  /** more blocks of any layer, each listed in the layer its folder in the release names */
  readonly blocks?: readonly string[];
  readonly domains?: readonly string[];
  /** by their paths from the unit's folder */
  readonly files?: Readonly<Record<string, string>>;
  readonly implementations?: readonly string[];
  readonly languages?: readonly string[];
  /** unit where it names none */
  readonly name?: string;
  /** the folders of its own packs, among its files */
  readonly packs?: readonly string[];
  readonly platforms?: readonly string[];
}

// This repository's package, the release a unit links as a project links the archive.
const release = join(import.meta.dir, '..', '..');
const LINK = '.droneey/constitution';
const created: string[] = [];
const applied = new Map<string, string>();

enum Layer {
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
}

const layers: readonly {
  folder: string;
  layer: Layer;
}[] = [
  {
    folder: 'domains',
    layer: Layer.Domains,
  },
  {
    folder: 'contexts/platforms',
    layer: Layer.Platforms,
  },
  {
    folder: 'contexts/languages',
    layer: Layer.Languages,
  },
];

const layerOf = (block: string): Layer =>
  layers.find(({ folder }) => existsSync(join(release, 'blocks', folder, block)))?.layer ??
  Layer.Implementations;

const listOf = (unit: UnitFixture, layer: Layer): string =>
  `[${[
    ...(unit[layer] ?? []),
    ...(unit.blocks ?? []).filter((block) => layerOf(block) === layer),
  ].join(', ')}]`;

const constitutionOf = (unit: UnitFixture): string =>
  [
    `name: ${JSON.stringify(unit.name ?? 'unit')}`,
    `axes: [${(
      unit.axes ?? [
        'architecture',
        'workflow',
      ]
    ).join(', ')}]`,
    `domains: ${listOf(unit, Layer.Domains)}`,
    `platforms: ${listOf(unit, Layer.Platforms)}`,
    `languages: ${listOf(unit, Layer.Languages)}`,
    `implementations: ${listOf(unit, Layer.Implementations)}`,
    `packs: [${(unit.packs ?? []).join(', ')}]`,
    'overrides: []',
    '',
  ].join('\n');

const writeFiles = (input: { files: Readonly<Record<string, string>>; folder: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

/**
 * Written once for each unit asked, by the program's own `presets apply`.
 *
 * @throws Error when the apply fails.
 */
const appliedUnit = (unit: UnitFixture): string => {
  const key = JSON.stringify(unit);
  const known = applied.get(key);

  if (known !== undefined) {
    return known;
  }

  const folder = mkdtempSync(join(tmpdir(), 'applied-unit-'));

  created.push(folder);
  writeFiles({
    files: {
      ...unit.files,
      'constitution.yaml': constitutionOf(unit),
    },
    folder,
  });
  mkdirSync(join(folder, dirname(LINK)), {
    recursive: true,
  });
  symlinkSync(release, join(folder, LINK));

  const run = spawnSync(
    cliPath,
    [
      'presets',
      'apply',
      '--no-fix',
      '--plain',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
      env: Object.fromEntries([
        [
          'PATH',
          process.env['PATH'],
        ],
      ]),
    },
  );

  if (run.status !== 0) {
    throw new Error(`presets apply failed in ${folder}: ${run.stdout}${run.stderr}`);
  }

  applied.set(key, folder);

  return folder;
};

process.once('exit', () => {
  for (const folder of created.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

export type { UnitFixture };
export { appliedUnit, constitutionOf };
