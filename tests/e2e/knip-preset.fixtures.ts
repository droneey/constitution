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

import { z } from 'zod';

interface Project {
  files: Readonly<Record<string, string>>;
  production?: boolean;
}

interface Unused {
  exports: readonly string[];
  files: readonly string[];
}

const REPORT = z.object({
  issues: z.array(
    z.object({
      exports: z.array(
        z.object({
          name: z.string(),
        }),
      ),
      file: z.string(),
      files: z.array(z.unknown()),
    }),
  ),
});

const CONFIG = `import architecture from './.constitution/presets/knip/architecture/core.mjs';
import core from './.constitution/presets/knip/foundation/core.mjs';
import self from './.constitution/presets/knip/foundation/self.mjs';

export default {
  ...self,
  entry: [...core.entry, ...architecture.entry],
  project: core.project,
};
`;

const REPOSITORY = join(import.meta.dir, '..', '..');
const KNIP = join(REPOSITORY, 'node_modules', '.bin', 'knip');

const unusedCode = (project: Project): Unused => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-knip-'));
  const files = {
    ...project.files,
    'knip.config.ts': CONFIG,
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

  const { issues } = REPORT.parse(JSON.parse(running.stdout));

  return {
    exports: issues.flatMap(({ exports }) => exports.map(({ name }) => name)),
    files: issues
      .filter(({ files: unused }) => unused.length > 0)
      .map(({ file }) => file),
  };
};

export { unusedCode };
