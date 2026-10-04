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
  parts?: readonly string[];
  production?: boolean;
  scripts?: Readonly<Record<string, string>>;
}

interface Unused {
  binaries: readonly string[];
  exports: readonly string[];
  files: readonly string[];
}

const REPORT = z.object({
  issues: z.array(
    z.object({
      binaries: z.array(
        z.object({
          name: z.string(),
        }),
      ),
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

const configOf = (parts: readonly string[]): string => {
  const names = parts.map((_, index) => `part${index}`);

  return `import architecture from './.droneey/constitution/presets/typescript/knip/architecture/core.mjs';
import core from './.droneey/constitution/presets/typescript/knip/foundation/core.mjs';
${parts
  .map(
    (part, index) =>
      `import ${names[index]} from './.droneey/constitution/presets/${part.replace('/', '/knip/')}.mjs';`,
  )
  .join('\n')}

export default {
  entry: [...core.entry, ...architecture.entry],
  project: core.project,
  ignoreBinaries: [${names.map((name) => `...${name}.ignoreBinaries`).join(', ')}],
};
`;
};

const REPOSITORY = join(import.meta.dir, '..', '..');
const KNIP = join(REPOSITORY, 'node_modules', '.bin', 'knip');

const unusedCode = (project: Project): Unused => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-knip-'));
  const files = {
    ...project.files,
    'knip.config.ts': configOf(project.parts ?? []),
    'package.json': JSON.stringify({
      name: 'fixture',
      scripts: {
        test: 'bun test',
        ...project.scripts,
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

  mkdirSync(join(folder, '.droneey'));
  symlinkSync(REPOSITORY, join(folder, '.droneey', 'constitution'));

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
    binaries: issues.flatMap(({ binaries }) =>
      binaries.map(({ name }) => name),
    ),
    exports: issues.flatMap(({ exports }) => exports.map(({ name }) => name)),
    files: issues
      .filter(({ files: unused }) => unused.length > 0)
      .map(({ file }) => file),
  };
};

export { unusedCode };
