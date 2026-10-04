import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { ENVIRONMENT } from './uv.fixtures';

type Files = Readonly<Record<string, string>>;

const REPOSITORY = join(import.meta.dir, '..', '..');

// A package laid out as the python block lays it out.
const SHOP_PACKAGE: Files = {
  'src/shop/__init__.py': '',
};

// The archive's Python tools, built from the repository's sources as the
// release builds them, each to its import package's entry.
const TOOLS = [
  {
    entry: 'python_check.main:main',
    tool: 'python-check',
  },
  {
    entry: 'mutmut_check.main:main',
    tool: 'mutmut-check',
  },
];

const writeFiles = (folder: string, files: Files): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

// The constitution is linked where a project links it: its presets and
// templates from the repository, and its tools, when the project runs them,
// built into the project's folder.
const linkConstitution = (input: { folder: string; withTools: boolean }): void => {
  const { folder } = input;
  const constitution = join(folder, '.droneey', 'constitution');

  mkdirSync(constitution, {
    recursive: true,
  });

  for (const entry of [
    'presets',
    'templates',
  ]) {
    symlinkSync(join(REPOSITORY, entry), join(constitution, entry));
  }

  for (const { entry, tool } of input.withTools ? TOOLS : []) {
    const dist = join(constitution, 'tools', tool, 'dist');

    mkdirSync(dist, {
      recursive: true,
    });

    const building = spawnSync(
      join(ENVIRONMENT, 'bin', 'python'),
      [
        '-m',
        'zipapp',
        join(REPOSITORY, 'tools', tool, 'src'),
        '-m',
        entry,
        '-o',
        join(dist, `${tool}.pyz`),
      ],
      {
        encoding: 'utf8',
      },
    );

    if (building.status !== 0) {
      throw new Error(`${tool} did not build: ${building.stderr}`);
    }
  }
};

// The callback runs in a temporary project, which is removed after it,
// whatever it returns or throws.
const inPythonProject = <TResult>(input: {
  files: Files;
  run: (folder: string) => TResult;
  withTools?: boolean;
}): TResult => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-python-'));

  try {
    linkConstitution({
      folder,
      withTools: input.withTools ?? false,
    });
    writeFiles(folder, {
      ...SHOP_PACKAGE,
      ...input.files,
    });

    return input.run(folder);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export type { Files };
export { inPythonProject, REPOSITORY, writeFiles };
