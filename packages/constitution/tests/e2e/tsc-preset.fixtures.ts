import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

interface Project {
  main: string;
  parts: readonly string[];
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const TSC = join(REPOSITORY, 'node_modules', '.bin', 'tsc');
const PRESETS_FOLDER = join(REPOSITORY, 'presets', 'typescript', 'tsc');

const presetParts = (): readonly string[] =>
  readdirSync(PRESETS_FOLDER)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .toSorted((left, right) => left.localeCompare(right));

// The project's types resolve from this repository's node_modules.
const typeChecks = (project: Project): boolean => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-tsconfig-'));

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));
  writeFileSync(
    join(folder, 'tsconfig.json'),
    JSON.stringify({
      extends: project.parts.map(
        (part) => `./.droneey/constitution/presets/typescript/tsc/${part}.json`,
      ),
      compilerOptions: {
        typeRoots: [
          join(REPOSITORY, 'node_modules', '@types'),
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

  const compilation = spawnSync(TSC, [
    '-p',
    folder,
  ]);

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return compilation.status === 0;
};

export { presetParts, typeChecks };
