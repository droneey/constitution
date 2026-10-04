import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { miseBinary } from './mise.fixtures';

const REPOSITORY = join(import.meta.dir, '..', '..');
const OSV_SCANNER = miseBinary('osv-scanner');
const EXECUTABLE = 0o755;
const SCANNED = /^Scanned (?<path>\S+) file/gm;

const auditScript = (): string => {
  const manifest: unknown = JSON.parse(readFileSync(join(REPOSITORY, 'package.json'), 'utf8'));
  const scripts =
    typeof manifest === 'object' && manifest !== null && 'scripts' in manifest
      ? manifest.scripts
      : undefined;
  const script =
    typeof scripts === 'object' && scripts !== null && 'audit:check' in scripts
      ? scripts['audit:check']
      : undefined;

  if (typeof script !== 'string') {
    throw new Error('package.json has no audit:check script');
  }

  return script;
};

const initRepository = (folder: string): void => {
  spawnSync(
    'git',
    [
      'init',
      '--quiet',
    ],
    {
      cwd: folder,
    },
  );
};

// A project nested in a folder its outer repository ignores, as an agent's worktree is, with its lockfiles at the
// root and one more in a folder below it. The audit script runs as written, through a stand-in for osv-scanner that
// drops the licences and adds --offline, so the run reads no network and stops after naming the files it scanned.
const lockfilesAudited = (): readonly string[] => {
  const outer = mkdtempSync(join(tmpdir(), 'constitution-osv-nested-'));
  const project = join(outer, 'nested', 'project');
  const bin = join(outer, 'bin');

  initRepository(outer);
  writeFileSync(join(outer, '.gitignore'), 'nested/\n');
  mkdirSync(join(project, '.venv'), {
    recursive: true,
  });
  initRepository(project);
  mkdirSync(join(project, '.droneey'));
  symlinkSync(REPOSITORY, join(project, '.droneey', 'constitution'));
  copyFileSync(join(REPOSITORY, 'bun.lock'), join(project, 'bun.lock'));
  copyFileSync(join(REPOSITORY, 'uv.lock'), join(project, 'uv.lock'));
  copyFileSync(join(REPOSITORY, 'uv.lock'), join(project, '.venv', 'uv.lock'));
  mkdirSync(bin);
  writeFileSync(
    join(bin, 'osv-scanner'),
    [
      '#!/bin/sh',
      'command="$1 $2"',
      'shift 2',
      'for argument in "$@"; do',
      '  case "$argument" in --licenses=*) ;; *) set -- "$@" "$argument" ;; esac',
      '  shift',
      'done',
      `exec '${OSV_SCANNER}' $command --offline "$@"`,
      '',
    ].join('\n'),
  );
  chmodSync(join(bin, 'osv-scanner'), EXECUTABLE);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
  };

  env['PATH'] = `${bin}:${process.env['PATH'] ?? ''}`;

  const run = spawnSync(
    'sh',
    [
      '-c',
      auditScript(),
    ],
    {
      cwd: project,
      encoding: 'utf8',
      env,
    },
  );

  rmSync(outer, {
    force: true,
    recursive: true,
  });

  return [
    ...`${run.stdout}${run.stderr}`.matchAll(SCANNED),
  ]
    .map((match) => (match.groups?.['path'] ?? '').split('/nested/project/').at(-1) ?? '')
    .toSorted((left, right) => left.localeCompare(right));
};

export { lockfilesAudited };
