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
import { dirname, join, normalize } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { createBatch } from './batch.fixtures';

interface BiomeUnit {
  /** the optional axes it follows; architecture and workflow where it names none */
  readonly axes?: readonly string[];
  readonly blocks: readonly string[];
}

interface Project {
  readonly files: Readonly<Record<string, string>>;
  readonly unit?: BiomeUnit;
}

interface Findings {
  readonly plugins: readonly string[];
  readonly rules: readonly string[];
}

const report = z.object({
  diagnostics: z.array(
    z.object({
      category: z.string(),
      location: z.object({
        path: z.string(),
      }),
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
          path: z.string(),
        }),
      ]),
    )
    .optional(),
});

const repository = join(import.meta.dir, '..', '..');
const biome = join(repository, 'node_modules', '.bin', 'biome');
const presetsFolder = join(repository, 'presets');
const presetFiles = join(presetsFolder, 'biome');
const blocks = join(repository, 'blocks');
const CONFIG = 'biome.json';

const baseUnit: BiomeUnit = {
  axes: [],
  blocks: [],
};

const defaultUnit: BiomeUnit = {
  blocks: [
    'bun-test',
    'react-dom',
  ],
};

// _react is listed through the renderer that needs it.
const listed: Readonly<Record<string, string>> = {
  _react: 'react-dom',
};

const appliedConfig = (unit: BiomeUnit): string =>
  readFileSync(
    join(
      appliedUnit({
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
      }),
      CONFIG,
    ),
    'utf8',
  );

const configOf = (unit: BiomeUnit): unknown => Bun.JSONC.parse(appliedConfig(unit));

const pairedBlocks = (): readonly string[] => [
  ...new Set(
    readdirSync(presetFiles, {
      recursive: true,
    })
      .map(String)
      .flatMap((path) =>
        path
          .replace(/\.yaml$/, '')
          .split('/')
          .filter((_, index, segments) => segments[index - 1] === 'with'),
      )
      .map((block) => listed[block] ?? block),
  ),
];

const widestUnit = (): BiomeUnit => ({
  blocks: pairedBlocks(),
});

// A plugin opens its message with the slug of its rule in brackets.
const PLUGIN_SLUG = /^\[([a-z0-9-]+)\]/;

const writeFiles = (folder: string, files: Readonly<Record<string, string>>): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

const MANIFEST = 'package.json';

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

// A glob not opened by ** matches only from the folder of its configuration.
const anchoredGlobs = (unit: BiomeUnit): readonly Bun.Glob[] =>
  includesOf(configOf(unit))
    .filter((glob) => !/^!{0,2}\*\*/.test(glob))
    .map((glob) => new Bun.Glob(glob.replace(/^!+/, '')));

const manifestOf = (project: Project): string | undefined =>
  Object.hasOwn(project.files, MANIFEST) ? project.files[MANIFEST] : undefined;

const keyOf = (project: Project): string =>
  JSON.stringify([
    project.unit ?? defaultUnit,
    Object.entries(project.files).toSorted(([left], [right]) => left.localeCompare(right)),
  ]);

// Projects of the same unit and manifest share one configuration and one run, each in a folder
// of its own beneath it; a project with a file an anchored glob matches keeps a configuration of
// its own.
const groupKeyOf = (key: string, project: Project): string => {
  const unit = project.unit ?? defaultUnit;
  const anchored = anchoredGlobs(unit);
  const isAnchored = Object.keys(project.files).some((path) =>
    anchored.some((glob) => glob.match(path)),
  );

  return JSON.stringify([
    unit,
    manifestOf(project) ?? '',
    isAnchored ? key : '',
  ]);
};

// The folder of a project's files, relative to its group's.
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

const RUNS_AT_ONCE = 4;

const appliedSettings = z.looseObject({});

// The configuration apply writes for the project's unit, outside a repository. Plugin paths
// resolve from its folder, so the presets are linked into each, where a case can put a file
// beside them.
const writeConfiguration = (folder: string, project: Project): void => {
  mkdirSync(join(folder, '.droneey', 'constitution'), {
    recursive: true,
  });
  symlinkSync(presetsFolder, join(folder, '.droneey', 'constitution', 'presets'));
  writeFiles(folder, {
    [CONFIG]: JSON.stringify({
      ...appliedSettings.parse(configOf(project.unit ?? defaultUnit)),
      vcs: {
        enabled: false,
      },
    }),
    ...Object.fromEntries(Object.entries(project.files).filter(([path]) => path === MANIFEST)),
  });
};

// A group of one project holds its files; a larger one holds a folder for each.
const writeGroup = (folder: string, entries: readonly Entry[]): Group => {
  const members = entries.map(([key, project], index) => {
    const member = entries.length === 1 ? '.' : String(index);

    if (index === 0) {
      writeConfiguration(folder, project);
    }

    writeFiles(
      join(folder, member),
      Object.fromEntries(Object.entries(project.files).filter(([path]) => path !== MANIFEST)),
    );

    return {
      folder: member,
      key,
    };
  });

  return {
    folder,
    members,
  };
};

const writeGroups = (root: string, entries: readonly Entry[]): readonly Group[] =>
  [
    ...Map.groupBy(entries, ([key, project]) => groupKeyOf(key, project)).values(),
  ].map((grouped, index) => writeGroup(join(root, String(index)), grouped));

const inRoot = async <T>(run: (root: string) => Promise<T>): Promise<T> => {
  const root = mkdtempSync(join(tmpdir(), 'constitution-biome-'));

  try {
    return await run(root);
  } finally {
    rmSync(root, {
      force: true,
      recursive: true,
    });
  }
};

const findingsOf = (
  diagnostics: z.infer<typeof report>['diagnostics'],
  member: Member,
): Findings => {
  const own = diagnostics.filter(
    ({ location }) => member.folder === '.' || location.path.startsWith(`${member.folder}/`),
  );

  return {
    plugins: own
      .filter(({ category }) => category === 'plugin')
      .map(({ message }) => PLUGIN_SLUG.exec(message)?.[1] ?? message),
    rules: own
      .filter(({ category }) => category !== 'plugin')
      .map(({ category }) => category.slice(category.lastIndexOf('/') + 1)),
  };
};

const lintGroup = async (
  group: Group,
): Promise<
  readonly (readonly [
    string,
    Findings,
  ])[]
> => {
  const linting = Bun.spawn(
    [
      biome,
      'lint',
      '--reporter=json',
      '--max-diagnostics=none',
      '.',
    ],
    {
      cwd: group.folder,
      stderr: 'ignore',
    },
  );
  const { diagnostics } = report.parse(JSON.parse(await new Response(linting.stdout).text()));

  return group.members.map((member) => [
    member.key,
    findingsOf(diagnostics, member),
  ]);
};

// Each group is a project of its own, for Biome checks types and the module graph only in the
// project of its root configuration; a few run at a time.
const lintAll = (entries: readonly Entry[]): Promise<ReadonlyMap<string, Findings>> =>
  inRoot(async (root) => {
    const queue = writeGroups(root, entries).values();

    const lintNext = async (): Promise<
      readonly (readonly [
        string,
        Findings,
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
  });

interface LintBatch {
  readonly lintCase: <TProject extends Project>(project: TProject) => TProject;
  readonly lintCases: <TRow extends Partial<Project>>(
    rows: readonly TRow[],
    base?: Partial<Project>,
  ) => readonly (Omit<TRow, keyof Project> & Required<Project>)[];
  /** @throws Error when no table registered the project, or before the batch is linted. */
  readonly lintFindings: (project: Project) => Findings;
  readonly lintRegistered: () => Promise<void>;
}

const createLintBatch = (): LintBatch => {
  const { outcomeOf, register, runRegistered } = createBatch({
    keyOf,
    runAll: lintAll,
  });

  // A row names the files its case adds to the table's and, where they differ, its unit.
  const lintCases = <TRow extends Partial<Project>>(
    rows: readonly TRow[],
    base: Partial<Project> = {},
  ): readonly (Omit<TRow, keyof Project> & Required<Project>)[] =>
    rows.map((row) =>
      register({
        ...row,
        files: {
          ...base.files,
          ...row.files,
        },
        unit: row.unit ?? base.unit ?? defaultUnit,
      }),
    );

  return {
    lintCase: register,
    lintCases,
    lintFindings: outcomeOf,
    lintRegistered: runRegistered,
  };
};

// Biome rewrites the file in place; the case reads back what it wrote.
const formattedText = (source: string): Promise<string> =>
  inRoot(async (root) => {
    const { folder } = writeGroup(root, [
      [
        'formatted',
        {
          files: {
            'src/order.ts': source,
          },
          unit: baseUnit,
        },
      ],
    ]);

    await Bun.spawn(
      [
        biome,
        'format',
        '--write',
        'src',
      ],
      {
        cwd: folder,
        stderr: 'ignore',
        stdout: 'ignore',
      },
    ).exited;

    return readFileSync(join(folder, 'src', 'order.ts'), 'utf8');
  });

const widestConfigText = (): string => appliedConfig(widestUnit());

const presetPlugins = (): readonly NonNullable<z.infer<typeof preset>['plugins']>[number][] =>
  preset.parse(configOf(widestUnit())).plugins ?? [];

// Biome 2.6 runs every entry of one path over the union of their includes, so an entry that
// narrows another narrows nothing.
const presetPluginPaths = (): readonly string[] =>
  presetPlugins().map((plugin) => normalize(typeof plugin === 'string' ? plugin : plugin.path));

const presetWords = (): readonly string[] => {
  const segments = presetPlugins()
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

export {
  blockCode,
  createLintBatch,
  formattedText,
  presetPluginPaths,
  presetWords,
  widestConfigText,
};
