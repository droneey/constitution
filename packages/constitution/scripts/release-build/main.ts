import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { z } from 'zod';

import manifest from '../../package.json' with { type: 'json' };
import { commandsOf } from './utils';

const packageFolder = resolve(import.meta.dir, '../..');

const releaseModel = z.record(
  z.string(),
  z.discriminatedUnion('with', [
    z.strictObject({
      from: z.string(),
      packages: z.literal('external').optional(),
      with: z.literal('bun'),
    }),
    z.strictObject({
      from: z.string(),
      main: z.string(),
      with: z.literal('zipapp'),
    }),
  ]),
);

// The presets check reads the same `release` list, so what it names is what the build makes.
const builds = releaseModel.parse(manifest.release);

for (const command of commandsOf(builds)) {
  mkdirSync(resolve(packageFolder, dirname(command.at(-1) ?? '')), {
    recursive: true,
  });

  const built = Bun.spawnSync(
    [
      ...command,
    ],
    {
      cwd: packageFolder,
      stderr: 'inherit',
      stdout: 'inherit',
    },
  );

  if (built.exitCode !== 0) {
    process.exit(built.exitCode);
  }
}
