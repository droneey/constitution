import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { cliPath } from './cli.fixtures';
import { linkRelease, release, toolEnvironment, writeFiles } from './package.fixtures';

interface UnitFixture {
  readonly axes?: readonly string[];
  readonly blocks?: readonly string[];
  readonly domains?: readonly string[];
  readonly files?: Readonly<Record<string, string>>;
  readonly implementations?: readonly string[];
  readonly languages?: readonly string[];
  readonly lowered?: readonly string[];
  readonly name?: string;
  readonly packs?: readonly string[];
  readonly platforms?: readonly string[];
}

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
    `overrides: [${(unit.lowered ?? [])
      .map((rule) => `{ rule: ${rule}, level: SHOULD, reason: "lowered by the case" }`)
      .join(', ')}]`,
    '',
  ].join('\n');

const APPLY = [
  'presets',
  'apply',
  '--no-fix',
  '--plain',
] as const;

const createdFolder = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'applied-unit-'));

  created.push(folder);

  return folder;
};

const unitFolderOf = (unit: UnitFixture): string => {
  const folder = createdFolder();

  writeFiles({
    files: {
      ...unit.files,
      'constitution.yaml': constitutionOf(unit),
    },
    folder,
  });
  linkRelease(folder);

  return folder;
};

const copyOf = (folder: string): string => {
  const copy = createdFolder();

  cpSync(folder, copy, {
    recursive: true,
    verbatimSymlinks: true,
  });

  return copy;
};

const appliedUnit = (unit: UnitFixture): string => {
  const key = JSON.stringify(unit);
  const known = applied.get(key);

  if (known !== undefined) {
    return copyOf(known);
  }

  const folder = unitFolderOf(unit);
  const run = spawnSync(cliPath, APPLY, {
    cwd: folder,
    encoding: 'utf8',
    env: toolEnvironment(),
  });

  if (run.status !== 0) {
    throw new Error(`presets apply failed in ${folder}: ${run.stdout}${run.stderr}`);
  }

  applied.set(key, folder);

  return copyOf(folder);
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
