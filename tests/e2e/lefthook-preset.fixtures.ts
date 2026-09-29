import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { YAML } from 'bun';

import { z } from 'zod';

enum Hook {
  PreCommit = 'pre-commit',
  CommitMessage = 'commit-msg',
}

interface HookRun {
  exitCode: number | undefined;
  output: string;
}

const PRESET = z.record(
  z.string(),
  z.object({
    jobs: z.array(
      z.object({
        name: z.string(),
        run: z.string(),
      }),
    ),
  }),
);

const REPOSITORY = join(import.meta.dir, '..', '..');
const PRESETS_FOLDER = join(REPOSITORY, 'presets', 'lefthook', 'workflow');

const presetConfig = (part: string): unknown =>
  YAML.parse(readFileSync(join(PRESETS_FOLDER, `${part}.yaml`), 'utf8'));

const jobRun = (input: { hook: Hook; job: string; part: string }): string =>
  PRESET.parse(presetConfig(input.part))[input.hook]?.jobs.find(
    ({ name }) => name === input.job,
  )?.run ?? 'exit 99';

// lefthook passes the message file as {1} and runs the job under sh.
const checkCommitMessage = (message: string): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-commit-'));
  const file = join(folder, 'COMMIT_EDITMSG');

  writeFileSync(file, message);

  const hookRun = spawnSync(
    'sh',
    [
      '-c',
      jobRun({
        hook: Hook.CommitMessage,
        job: 'commit-message',
        part: 'core',
      }).replaceAll('{1}', file),
    ],
    {
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return {
    exitCode: hookRun.status ?? undefined,
    output: hookRun.stdout.trim(),
  };
};

export { checkCommitMessage, Hook, jobRun, presetConfig };
