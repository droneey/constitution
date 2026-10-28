import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit } from './applied-unit.fixtures';
import { createBatch } from './batch.fixtures';
import type { BiomeDiagnostic } from './biome-preset.fixtures';
import { biomeDiagnostics } from './biome-preset.fixtures';
import { linkRelease, release, writeFiles } from './package.fixtures';

interface BiomeUnit {
  readonly axes?: readonly string[];
  readonly blocks: readonly string[];
}

interface Project {
  readonly files: Readonly<Record<string, string>>;
  readonly unit: BiomeUnit;
}

interface Sample {
  readonly condition: string;
  readonly files: Readonly<Record<string, string>>;
  readonly unit?: BiomeUnit;
}

interface PluginRow {
  readonly allowed?: readonly Sample[];
  readonly language: string;
  readonly reported: readonly Sample[];
  readonly slug: string;
  readonly unit?: BiomeUnit;
}

interface PluginCase {
  readonly condition: string;
  readonly project: Project;
  readonly slug: string;
}

const PRESETS = 'presets';
const pluginsFolder = join(release, PRESETS, 'biome', 'plugins');
const CONFIG = 'biome.jsonc';
const MANIFEST = 'package.json';
const PLUGIN_CATEGORY = 'plugin';
const LINT_CATEGORY = 'lint/';
const PLUGIN_FILE = /\.grit$/;
const PLUGIN_SLUG = /^\[([a-z0-9-]+)\]/;
const RUNS_AT_ONCE = 4;
const typescriptUnit: BiomeUnit = {
  blocks: [
    'bun-test',
    'react-dom',
  ],
};

const unitFixtureOf = (unit: BiomeUnit): UnitFixture => ({
  ...(unit.axes === undefined
    ? {}
    : {
        axes: unit.axes,
      }),
  blocks: unit.blocks,
  implementations: [
    'biome',
  ],
  languages: [
    'typescript',
  ],
});

const configs = new Map<string, unknown>();

const configOf = (unit: BiomeUnit): unknown => {
  const key = JSON.stringify(unit);

  if (!configs.has(key)) {
    configs.set(
      key,
      Bun.JSONC.parse(readFileSync(join(appliedUnit(unitFixtureOf(unit)), CONFIG), 'utf8')),
    );
  }

  return configs.get(key);
};

const includesOf = (configuration: unknown): readonly string[] => {
  if (Array.isArray(configuration)) {
    return configuration.flatMap(includesOf);
  }

  if (typeof configuration !== 'object' || configuration === null) {
    return [];
  }

  return Object.entries(configuration).flatMap(([name, inner]) =>
    name === 'includes' && Array.isArray(inner) ? inner.map(String) : includesOf(inner),
  );
};

// Why: a glob not opened by ** matches only from the folder of its configuration.
const anchoredGlobs = (unit: BiomeUnit): readonly Bun.Glob[] =>
  includesOf(configOf(unit))
    .filter((glob) => !/^!{0,2}\*\*/.test(glob))
    .map((glob) => new Bun.Glob(glob.replace(/^!+/, '')));

const keyOf = (project: Project): string =>
  JSON.stringify([
    project.unit,
    Object.entries(project.files).toSorted(([left], [right]) => left.localeCompare(right)),
  ]);

const groupKeyOf = (key: string, project: Project): string => {
  const anchored = anchoredGlobs(project.unit);
  const isAnchored = Object.keys(project.files).some((path) =>
    anchored.some((glob) => glob.match(path)),
  );

  return JSON.stringify([
    project.unit,
    project.files[MANIFEST],
    isAnchored ? key : '',
  ]);
};

interface Member {
  readonly folder: string;
  readonly key: string;
}

interface Group {
  readonly folder: string;
  readonly members: readonly Member[];
}

type Entry = readonly [
  string,
  Project,
];

// Why: plugin paths resolve from the configuration's folder, so the presets are linked into each
// group.
const writeConfiguration = (folder: string, project: Project): void => {
  linkRelease(folder, PRESETS);
  writeFiles({
    files: {
      [CONFIG]: JSON.stringify({
        ...z.looseObject({}).parse(configOf(project.unit)),
        vcs: {
          enabled: false,
        },
      }),
      ...Object.fromEntries(Object.entries(project.files).filter(([path]) => path === MANIFEST)),
    },
    folder,
  });
};

const writeGroup = (folder: string, entries: readonly Entry[]): Group => ({
  folder,
  members: entries.map(([key, project], index) => {
    const member = entries.length === 1 ? '.' : String(index);

    if (index === 0) {
      writeConfiguration(folder, project);
    }

    writeFiles({
      files: Object.fromEntries(
        Object.entries(project.files).filter(([path]) => path !== MANIFEST),
      ),
      folder: join(folder, member),
    });

    return {
      folder: member,
      key,
    };
  }),
});

const pluginsOfMember = (
  diagnostics: readonly BiomeDiagnostic[],
  member: Member,
): readonly string[] =>
  diagnostics
    .filter(
      ({ category, location }) =>
        category === PLUGIN_CATEGORY &&
        (member.folder === '.' || location.path.startsWith(`${member.folder}/`)),
    )
    .map(({ message }) => PLUGIN_SLUG.exec(message)?.[1] ?? message);

const lintGroup = async (
  group: Group,
): Promise<
  readonly (readonly [
    string,
    readonly string[],
  ])[]
> => {
  const diagnostics = await biomeDiagnostics(group.folder);
  const unlinted = diagnostics.filter(
    ({ category }) => category !== PLUGIN_CATEGORY && !category.startsWith(LINT_CATEGORY),
  );

  if (unlinted.length > 0) {
    throw new Error(
      `Biome reported more than findings in ${group.folder}: ${unlinted.map(({ category, message }) => `${category}: ${message}`).join('; ')}`,
    );
  }

  return group.members.map((member) => [
    member.key,
    pluginsOfMember(diagnostics, member),
  ]);
};

// Why: Biome checks types and the module graph only in the project of its root configuration, so
// each group is a project of its own; a few run at a time.
const lintAll = async (
  entries: readonly Entry[],
): Promise<ReadonlyMap<string, readonly string[]>> => {
  const root = mkdtempSync(join(tmpdir(), 'constitution-biome-plugins-'));

  try {
    const queue = [
      ...Map.groupBy(entries, ([key, project]) => groupKeyOf(key, project)).values(),
    ]
      .map((grouped, index) => writeGroup(join(root, String(index)), grouped))
      .values();

    const lintNext = async (): Promise<
      readonly (readonly [
        string,
        readonly string[],
      ])[]
    > => {
      const next = queue.next();

      return next.done === true
        ? []
        : [
            ...(await lintGroup(next.value)),
            ...(await lintNext()),
          ];
    };

    const runs = await Promise.all(
      Array.from(
        {
          length: RUNS_AT_ONCE,
        },
        lintNext,
      ),
    );

    return new Map(runs.flat());
  } finally {
    rmSync(root, {
      force: true,
      recursive: true,
    });
  }
};

interface PluginBatch {
  readonly allowedCases: (rows: readonly PluginRow[]) => readonly PluginCase[];
  readonly lintRegistered: () => Promise<void>;
  readonly pluginsOf: (project: Project) => readonly string[];
  readonly reportedCases: (rows: readonly PluginRow[]) => readonly PluginCase[];
}

const createPluginBatch = (): PluginBatch => {
  const { outcomeOf, register, runRegistered } = createBatch({
    keyOf,
    runAll: lintAll,
  });

  const caseOf = (row: PluginRow, sample: Sample): PluginCase => ({
    condition: sample.condition,
    project: register({
      files: sample.files,
      unit: sample.unit ?? row.unit ?? typescriptUnit,
    }),
    slug: row.slug,
  });

  return {
    allowedCases: (rows) =>
      rows.flatMap((row) => (row.allowed ?? []).map((sample) => caseOf(row, sample))),
    lintRegistered: runRegistered,
    pluginsOf: outcomeOf,
    reportedCases: (rows) =>
      rows.flatMap((row) => row.reported.map((sample) => caseOf(row, sample))),
  };
};

const pluginsWithNoRow = (rows: readonly PluginRow[]): readonly string[] =>
  readdirSync(pluginsFolder, {
    recursive: true,
  })
    .map(String)
    .filter((path) => PLUGIN_FILE.test(path))
    .filter((path) => !rows.some(({ language, slug }) => path === join(language, `${slug}.grit`)));

export type { PluginRow };
export { createPluginBatch, pluginsWithNoRow };
