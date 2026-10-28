import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { toolEnvironment } from './package.fixtures';
import { uvEnvironment } from './uv.fixtures';

type Files = Readonly<Record<string, string>>;

const repository = join(import.meta.dir, '..', '..');

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

const SHOP_PACKAGE: Files = {
  'src/shop/__init__.py': '',
} as const;

const tools = [
  {
    module: 'droneey_python_check',
    tool: 'python-check',
  },
  {
    module: 'droneey_mutation_check_python',
    tool: 'mutmut-check',
  },
];

const sourceOf = (module: string): string =>
  spawnSync(
    join(uvEnvironment, 'bin', 'python'),
    [
      '-c',
      `import pathlib, ${module}; print(pathlib.Path(${module}.__file__).parent.parent)`,
    ],
    {
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  ).stdout.trim();

const writeFiles = (folder: string, files: Files): void => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }
};

interface BuiltTool {
  readonly tool: string;
  readonly zipapp: Buffer;
}

const builtTool = (input: { module: string; tool: string }): BuiltTool => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-python-tool-'));
  const zipapp = join(folder, `${input.tool}.pyz`);

  try {
    const building = spawnSync(
      join(uvEnvironment, 'bin', 'python'),
      [
        '-m',
        'zipapp',
        sourceOf(input.module),
        '-m',
        `${input.module}.main:main`,
        '-o',
        zipapp,
      ],
      {
        encoding: 'utf8',
        env: toolEnvironment(),
      },
    );

    if (building.status !== 0) {
      throw new Error(`${input.tool} did not build: ${building.stderr}`);
    }

    return {
      zipapp: readFileSync(zipapp),
      tool: input.tool,
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const buildTools = (): readonly BuiltTool[] => tools.map(builtTool);

const linkConstitution = (input: { folder: string; tools: readonly BuiltTool[] }): void => {
  const { folder } = input;
  const constitution = join(folder, '.droneey', 'constitution');

  mkdirSync(constitution, {
    recursive: true,
  });

  for (const entry of [
    'presets',
    'templates',
  ]) {
    symlinkSync(join(repository, entry), join(constitution, entry));
  }

  for (const tool of input.tools) {
    const dist = join(constitution, 'tools', tool.tool, 'dist');

    mkdirSync(dist, {
      recursive: true,
    });
    writeFileSync(join(dist, `${tool.tool}.pyz`), tool.zipapp);
  }
};

const fillPythonProject = (
  folder: string,
  input: {
    files: Files;
    tools?: readonly BuiltTool[];
  },
): void => {
  linkConstitution({
    folder,
    tools: input.tools ?? [],
  });
  writeFiles(folder, {
    ...SHOP_PACKAGE,
    ...input.files,
  });
};

interface PythonProjectRun<TResult> {
  readonly files: Files;
  readonly run: (folder: string) => TResult;
  readonly tools?: readonly BuiltTool[];
}

const inPythonProjectAsync = async <TResult>(
  input: PythonProjectRun<Promise<TResult>>,
): Promise<TResult> => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-python-'));

  try {
    fillPythonProject(folder, input);

    return await input.run(folder);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export type { BuiltTool, Files };
export { buildTools, inPythonProjectAsync, python, writeFiles };
