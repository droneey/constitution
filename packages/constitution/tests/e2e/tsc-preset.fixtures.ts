import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import type { UnitFixture } from './applied-unit.fixtures';
import { appliedUnit } from './applied-unit.fixtures';
import type { Entries } from './batch.fixtures';
import { createBatch } from './batch.fixtures';

interface Project {
  /** the blocks of the unit beside its language's and tsc */
  blocks: readonly string[];
  main: string;
}

const repository = join(import.meta.dir, '..', '..');
const tsc = join(repository, 'node_modules', '.bin', 'tsc');
const pairedFolder = join(repository, 'presets', 'tsc', 'foundation', 'with');
const tsconfig = z.looseObject({
  compilerOptions: z.looseObject({}),
});

const pairedBlocks = (): readonly string[] =>
  readdirSync(pairedFolder)
    .map((name) => name.replace(/\.yaml$/, ''))
    .toSorted((left, right) => left.localeCompare(right));

const keyOf = (project: Project): string =>
  JSON.stringify([
    project.blocks,
    project.main,
  ]);

// _react is listed through the renderer that needs it.
const listed: Readonly<Record<string, string>> = {
  _react: 'react-dom',
};

const unitOf = (blocks: readonly string[]): UnitFixture => ({
  blocks: blocks.map((block) => listed[block] ?? block),
  implementations: [
    'tsc',
  ],
  languages: [
    'typescript',
  ],
});

// The applied tsconfig.json checks the two files beside it; its types resolve from this
// repository's node_modules.
const writeProject = (folder: string, project: Project): void => {
  const applied = tsconfig.parse(
    Bun.JSONC.parse(
      readFileSync(join(appliedUnit(unitOf(project.blocks)), 'tsconfig.json'), 'utf8'),
    ),
  );

  mkdirSync(folder, {
    recursive: true,
  });
  writeFileSync(
    join(folder, 'tsconfig.json'),
    JSON.stringify({
      ...applied,
      compilerOptions: {
        ...applied.compilerOptions,
        typeRoots: [
          join(repository, 'node_modules', '@types'),
        ],
      },
      include: [
        '*.ts',
      ],
    }),
  );
  writeFileSync(
    join(folder, 'order.ts'),
    "export interface Order { id: string }\nexport const ORDER_KIND = 'order';\n",
  );
  writeFileSync(join(folder, 'main.ts'), project.main);
};

// The TypeScript code of each error tsc reports: <path>(<line>,<column>): error TS<code>.
const ERROR = /^(?<path>[^\n]*): error (?<code>TS\d+)/gm;

// One build checks every project given, each in a folder named by its index, and gives each the
// codes of its errors.
/** @throws Error when tsc leaves a project unbuilt or reports an error outside every project. */
const typeCheckAll = (entries: Entries<Project>): ReadonlyMap<string, readonly string[]> => {
  const root = mkdtempSync(join(tmpdir(), 'constitution-tsconfig-'));

  try {
    entries.forEach(([, project], index) => {
      writeProject(join(root, String(index)), project);
    });

    const compilation = spawnSync(
      tsc,
      [
        '-b',
        ...entries.map((_, index) => String(index)),
        '--pretty',
        'false',
        '--verbose',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

    // --verbose names each project it builds: Building project '<folder>/tsconfig.json'.
    const unbuilt = entries.filter(
      (_, index) =>
        !compilation.stdout.includes(`Building project '${String(index)}/tsconfig.json'`),
    );

    if (unbuilt.length > 0) {
      throw new Error(
        `tsc built no project of ${String(unbuilt.length)} folders: ${compilation.stdout}`,
      );
    }

    const errors = [
      ...compilation.stdout.matchAll(ERROR),
    ].map((match) => ({
      code: match.groups?.['code'] ?? '',
      folder: match.groups?.['path']?.split('/')[0] ?? '',
    }));

    if (errors.some(({ folder }) => !/^\d+$/.test(folder))) {
      throw new Error(`tsc reported an error outside every project: ${compilation.stdout}`);
    }

    return new Map(
      entries.map(([key], index) => [
        key,
        [
          ...new Set(
            errors.filter(({ folder }) => folder === String(index)).map(({ code }) => code),
          ),
        ].toSorted((left, right) => left.localeCompare(right)),
      ]),
    );
  } finally {
    rmSync(root, {
      force: true,
      recursive: true,
    });
  }
};

interface TscBatch {
  readonly typeCheckCases: <TRow extends Project>(rows: readonly TRow[]) => readonly TRow[];
  /** @throws Error when no table registered the project, or before the batch is checked. */
  readonly typeCheckCodes: (project: Project) => readonly string[];
  readonly typeCheckRegistered: () => Promise<void>;
}

const createTypeCheckBatch = (): TscBatch => {
  const { outcomeOf, register, runRegistered } = createBatch({
    keyOf,
    runAll: (entries: Entries<Project>) => Promise.resolve(typeCheckAll(entries)),
  });

  return {
    typeCheckCases: (rows) => rows.map(register),
    typeCheckCodes: outcomeOf,
    typeCheckRegistered: runRegistered,
  };
};

export { createTypeCheckBatch, pairedBlocks };
