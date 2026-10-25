import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

interface Project {
  main: string;
  parts: readonly string[];
}

const repository = join(import.meta.dir, '..', '..');
const tsc = join(repository, 'node_modules', '.bin', 'tsc');
const presetsFolder = join(repository, 'presets', 'typescript', 'tsc', 'foundation');

const presetParts = (): readonly string[] =>
  readdirSync(presetsFolder)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .toSorted((left, right) => left.localeCompare(right));

const registered = new Map<string, Project>();
const checked = new Map<string, boolean>();

const keyOf = (project: Project): string =>
  JSON.stringify([
    project.parts,
    project.main,
  ]);

// A table registers its projects while the file is collected.
const typeCheckCases = <TRow extends Project>(rows: readonly TRow[]): readonly TRow[] =>
  rows.map((row) => {
    registered.set(keyOf(row), row);

    return row;
  });

// The project's types resolve from this repository's node_modules.
const writeProject = (folder: string, project: Project): void => {
  mkdirSync(join(folder, '.droneey'), {
    recursive: true,
  });
  symlinkSync(repository, join(folder, '.droneey', 'constitution'));
  writeFileSync(
    join(folder, 'tsconfig.json'),
    JSON.stringify({
      extends: project.parts.map(
        (part) => `./.droneey/constitution/presets/typescript/tsc/foundation/${part}.json`,
      ),
      compilerOptions: {
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

// One build checks every registered project, each in a folder named by its index; tsc writes a
// diagnostic as <path>(<line>,<column>): error TS<code>, so a project is clean when no error
// names its folder.
/** @throws Error when tsc leaves a project unbuilt or reports an error outside every project. */
const typeCheckRegistered = (): void => {
  const root = mkdtempSync(join(tmpdir(), 'constitution-tsconfig-'));
  const entries = [
    ...registered,
  ];

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

  rmSync(root, {
    force: true,
    recursive: true,
  });

  // --verbose names each project it builds: Building project '<folder>/tsconfig.json'.
  const unbuilt = entries.filter(
    (_, index) => !compilation.stdout.includes(`Building project '${String(index)}/tsconfig.json'`),
  );

  if (unbuilt.length > 0) {
    throw new Error(
      `tsc built no project of ${String(unbuilt.length)} folders: ${compilation.stdout}`,
    );
  }

  const failing = compilation.stdout
    .split('\n')
    .filter((line) => line.includes(': error TS'))
    .map((line) => line.split('/')[0] ?? '');
  const stray = failing.filter((folder) => !/^\d+$/.test(folder));

  if (stray.length > 0) {
    throw new Error(`tsc reported an error outside every project: ${compilation.stdout}`);
  }

  entries.forEach(([key], index) => {
    checked.set(key, !failing.includes(String(index)));
  });
};

/** @throws Error when no table registered the project. */
const typeChecks = (project: Project): boolean => {
  const isClean = checked.get(keyOf(project));

  if (isClean === undefined) {
    throw new Error(`No table registered the project of ${project.parts.join(', ')}`);
  }

  return isClean;
};

export { presetParts, typeCheckCases, typeCheckRegistered, typeChecks };
