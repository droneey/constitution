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
  readonly files: Readonly<Record<string, string>>;
  readonly parts?: readonly string[];
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

const partFile = (part: string): string =>
  `${part.replace('/', '/biome/').replace(/\/biome\/(?!architecture\/|workflow\/)/, '/biome/foundation/')}.jsonc`;

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
const anchoredGlobs = (parts: readonly string[]): readonly Bun.Glob[] =>
  parts
    .flatMap((part) =>
      includesOf(Bun.JSONC.parse(readFileSync(join(presetsFolder, partFile(part)), 'utf8'))),
    )
    .filter((glob) => !/^!{0,2}\*\*/.test(glob))
    .map((glob) => new Bun.Glob(glob.replace(/^!+/, '')));

const manifestOf = (project: Project): string | undefined =>
  Object.hasOwn(project.files, MANIFEST) ? project.files[MANIFEST] : undefined;

const keyOf = (project: Project): string =>
  JSON.stringify([
    project.parts ?? PARTS,
    Object.entries(project.files).toSorted(([left], [right]) => left.localeCompare(right)),
  ]);

// Projects of the same parts and manifest share one configuration and one run, each in a folder
// of its own beneath it; a project with a file an anchored glob matches keeps a configuration of
// its own.
const groupKeyOf = (key: string, project: Project): string => {
  const parts = project.parts ?? PARTS;
  const anchored = anchoredGlobs(parts);
  const isAnchored = Object.keys(project.files).some((path) =>
    anchored.some((glob) => glob.match(path)),
  );

  return JSON.stringify([
    parts,
    manifestOf(project) ?? '',
    isAnchored ? key : '',
  ]);
};

const registered = new Map<string, Project>();
const linted = new Map<string, Findings>();

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

// Plugin paths resolve from the configuration's folder, so .droneey/constitution is linked
// into each, where a case can put a file beside the presets.
const writeConfiguration = (folder: string, project: Project): void => {
  mkdirSync(join(folder, '.droneey', 'constitution'), {
    recursive: true,
  });
  symlinkSync(presetsFolder, join(folder, '.droneey', 'constitution', 'presets'));
  writeFiles(folder, {
    'biome.json': JSON.stringify({
      extends: (project.parts ?? PARTS).map(
        (part) => `./.droneey/constitution/presets/${partFile(part)}`,
      ),
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
  const outcome = await run(root);

  rmSync(root, {
    force: true,
    recursive: true,
  });

  return outcome;
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

const lintGroup = async (group: Group): Promise<void> => {
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

  for (const member of group.members) {
    linted.set(member.key, findingsOf(diagnostics, member));
  }
};

// Each group is a project of its own, for Biome checks types and the module graph only in the
// project of its root configuration; a few run at a time.
const lintAll = (entries: readonly Entry[]): Promise<void> =>
  inRoot(async (root) => {
    const queue = writeGroups(root, entries).values();

    const lintNext = async (): Promise<void> => {
      const next = queue.next();

      if (next.done !== true) {
        await lintGroup(next.value);
        await lintNext();
      }
    };

    await Promise.all(
      Array.from(
        {
          length: RUNS_AT_ONCE,
        },
        lintNext,
      ),
    );
  });

const lintCase = <TProject extends Project>(project: TProject): TProject => {
  registered.set(keyOf(project), project);

  return project;
};

// A row names the files its case adds to the table's and, where they differ, its parts.
const lintCases = <TRow extends Partial<Project>>(
  rows: readonly TRow[],
  base: Partial<Project> = {},
): readonly (Omit<TRow, keyof Project> & Required<Project>)[] =>
  rows.map((row) =>
    lintCase({
      ...row,
      files: {
        ...base.files,
        ...row.files,
      },
      parts: row.parts ?? base.parts ?? PARTS,
    }),
  );

// Lints every registered project, once the tables are collected.
const lintRegistered = (): Promise<void> =>
  lintAll([
    ...registered,
  ]);

/** @throws Error when no table registered the project. */
const lintFindings = (project: Project): Findings => {
  const findings = linted.get(keyOf(project));

  if (findings === undefined) {
    throw new Error(`No table registered the project of ${Object.keys(project.files).join(', ')}`);
  }

  return findings;
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
          parts: baseParts,
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

export {
  baseParts,
  blockCode,
  formattedText,
  lintCase,
  lintCases,
  lintFindings,
  lintRegistered,
  presetFiles,
  presetText,
  presetWords,
};
