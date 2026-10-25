import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { HooksState } from '../../../domain/entities';
import { createLefthookGitHooks } from '../lefthook-git-hooks.adapter';

const PATH = 'PATH';

let root = '';

const projectOf = (input: { config?: string }): string => {
  const project = join(root, 'project');

  mkdirSync(join(project, '.config'), {
    recursive: true,
  });

  if (input.config !== undefined) {
    writeFileSync(join(project, input.config), 'pre-commit: {}\n');
  }

  return project;
};

const TIMEOUT_MS = 10_000;

// A lefthook on PATH that runs the script given.
const binOf = (script: string): string => {
  const bin = join(root, 'bin');
  const path = join(bin, 'lefthook');

  mkdirSync(bin, {
    recursive: true,
  });
  writeFileSync(path, `#!/bin/sh\n${script}\n`);
  chmodSync(path, 0o755);

  return bin;
};

// A lefthook on PATH that answers check-install with the code given.
const binWith = (code: number): string =>
  binOf(`[ "$1" = check-install ] && exit ${String(code)}\nexit 9`);

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'lefthook-git-hooks-'));
});

afterEach(() => {
  rmSync(root, {
    force: true,
    recursive: true,
  });
});

describe('createLefthookGitHooks', () => {
  it.each([
    {
      code: 0,
      condition: 'lefthook says they are installed',
      config: 'lefthook.yaml',
      state: HooksState.Installed,
    },
    {
      code: 1,
      condition: 'lefthook says they are not',
      config: '.config/lefthook.yml',
      state: HooksState.Missing,
    },
    {
      code: 0,
      condition: 'lefthook reads JSON',
      config: 'lefthook.json',
      state: HooksState.Installed,
    },
    {
      code: 0,
      condition: 'lefthook reads JSON with comments',
      config: '.lefthook.jsonc',
      state: HooksState.Installed,
    },
  ])('should report the hooks as $state when $condition', ({ code, config, state }) => {
    // Arrange
    const project = projectOf({
      config,
    });
    const hooks = createLefthookGitHooks({
      env: {
        [PATH]: `${binWith(code)}:/bin:/usr/bin`,
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const found = hooks.stateOf(project);

    // Assert
    expect(found).toBe(state);
  });

  it('should report the project as unconfigured when it keeps no lefthook configuration', () => {
    // Arrange
    const project = projectOf({});
    const hooks = createLefthookGitHooks({
      env: {
        [PATH]: `${binWith(0)}:/bin:/usr/bin`,
      },
      timeoutMs: TIMEOUT_MS,
    });

    // Act
    const found = hooks.stateOf(project);

    // Assert
    expect(found).toBe(HooksState.Unconfigured);
  });

  it.each([
    {
      condition: 'it is not on PATH',
      path: (): string => join(root, 'empty'),
      timeoutMs: TIMEOUT_MS,
    },
    {
      condition: 'it does not answer within its time',
      path: (): string => `${binOf('/bin/sleep 5')}:/bin:/usr/bin`,
      timeoutMs: 200,
    },
  ])('should report lefthook as unavailable when $condition', ({ path, timeoutMs }) => {
    // Arrange
    const project = projectOf({
      config: '.lefthook.toml',
    });
    const hooks = createLefthookGitHooks({
      env: {
        [PATH]: path(),
      },
      timeoutMs,
    });

    // Act
    const found = hooks.stateOf(project);

    // Assert
    expect(found).toBe(HooksState.Unavailable);
  });
});
