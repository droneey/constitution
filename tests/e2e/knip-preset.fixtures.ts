import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

interface Report {
  issues: readonly {
    exports: readonly {
      name: string;
    }[];
    file: string;
    files: readonly unknown[];
  }[];
}

interface Project {
  files: Readonly<Record<string, string>>;
  production?: boolean;
}

interface Unused {
  exports: readonly string[];
  files: readonly string[];
}

const REPOSITORY = join(import.meta.dir, '..', '..');
const KNIP = join(REPOSITORY, 'node_modules', '.bin', 'knip');

const unusedCode = (project: Project): Unused => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-knip-'));
  const files = {
    ...project.files,
    'knip.config.ts':
      "export { default } from './.constitution/presets/knip/base.mjs';\n",
    'package.json': JSON.stringify({
      name: 'fixture',
      scripts: {
        test: 'bun test',
      },
      type: 'module',
    }),
  };

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  symlinkSync(REPOSITORY, join(folder, '.constitution'));

  const running = spawnSync(
    KNIP,
    [
      '--reporter',
      'json',
      '--no-config-hints',
      ...(project.production
        ? [
            '--production',
          ]
        : []),
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  const { issues } = JSON.parse(running.stdout) as Report;

  return {
    exports: issues.flatMap(({ exports }) => exports.map(({ name }) => name)),
    files: issues
      .filter(({ files: unused }) => unused.length > 0)
      .map(({ file }) => file),
  };
};

export { unusedCode };
