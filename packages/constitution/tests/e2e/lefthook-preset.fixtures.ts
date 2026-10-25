import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { YAML } from 'bun';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

enum Hook {
  PreCommit = 'pre-commit',
  CommitMessage = 'commit-msg',
}

interface HookRun {
  exitCode: number | undefined;
  output: string;
}

const preset = z.record(
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

interface PartJob {
  hook: string;
  job: string;
  part: string;
  run: string;
}

const repository = join(import.meta.dir, '..', '..');
const presetsFolder = join(repository, 'presets', 'common', 'lefthook', 'workflow');
const shellcheckRc = join(
  repository,
  'presets',
  'shell',
  'shellcheck',
  'foundation',
  'self.shellcheckrc',
);
const shellcheck = miseBinary('shellcheck');

const presetConfig = (part: string): unknown =>
  YAML.parse(readFileSync(join(presetsFolder, `${part}.yaml`), 'utf8'));

const jobRun = (input: { hook: Hook; job: string; part: string }): string =>
  preset.parse(presetConfig(input.part))[input.hook]?.jobs.find(({ name }) => name === input.job)
    ?.run ?? 'exit 99';

const partJobs = (): readonly PartJob[] =>
  readdirSync(presetsFolder)
    .filter((file) => file.endsWith('.yaml') && file !== 'bindings.yaml')
    .flatMap((file) => {
      const part = file.slice(0, -'.yaml'.length);

      return Object.entries(preset.parse(presetConfig(part))).flatMap(([hook, { jobs }]) =>
        jobs.map(({ name, run }) => ({
          hook,
          job: name,
          part,
          run,
        })),
      );
    });

// lefthook runs a job under sh with its files in place of {staged_files} and
// the message file in place of {1}; ShellCheck reads the command as such a script.
const shellCheckRun = (run: string): HookRun => {
  const check = spawnSync(
    shellcheck,
    [
      '--rcfile',
      shellcheckRc,
      '--shell=sh',
      '--format=gcc',
      '-',
    ],
    {
      encoding: 'utf8',
      input: run.replaceAll('{staged_files}', '"$@"').replaceAll('{1}', '"$1"'),
    },
  );

  return {
    exitCode: check.status ?? undefined,
    output: check.stdout.trim(),
  };
};

const git = (folder: string, args: readonly string[]): void => {
  spawnSync(
    'git',
    [
      '-c',
      'user.name=Spec',
      '-c',
      'user.email=spec@example.com',
      ...args,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );
};

// The branch is checked out in a repository of one commit; undefined detaches HEAD.
const checkBranch = (branch: string | undefined): HookRun => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-branch-'));

  try {
    git(folder, [
      'init',
      '--quiet',
    ]);
    git(folder, [
      'commit',
      '--quiet',
      '--allow-empty',
      '--message',
      'chore: Start',
    ]);
    git(
      folder,
      branch === undefined
        ? [
            'checkout',
            '--quiet',
            '--detach',
          ]
        : [
            'checkout',
            '--quiet',
            '-b',
            branch,
          ],
    );

    const hookRun = spawnSync(
      'sh',
      [
        '-c',
        jobRun({
          hook: Hook.PreCommit,
          job: 'validate-branch',
          part: 'version-control',
        }),
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return {
      exitCode: hookRun.status ?? undefined,
      output: hookRun.stdout.trim(),
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

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
        part: 'version-control',
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

export { checkBranch, checkCommitMessage, Hook, jobRun, partJobs, shellCheckRun };
