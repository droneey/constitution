import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  contextOf,
  HookEvent,
  newSession,
  removeSessions,
  runHook,
  stateFolderOf,
} from '../hook.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();
  removeSessions();
});

afterAll(() => {
  removePluginRoots();
});

describe('the session state the session-start hook saves', () => {
  it.each([
    {
      condition: 'a subagent starts',
      event: HookEvent.Subagent,
      prefix: '',
    },
    {
      condition: 'the session id is not a plain name',
      event: HookEvent.Startup,
      prefix: '../',
    },
  ])('should save nothing when $condition', ({ event, prefix }) => {
    // Arrange
    const project = createProject({
      config: configOf({}),
    });
    const session = newSession();

    // Act
    runHook({
      event,
      project,
      root,
      session: `${prefix}${session}`,
    });

    // Assert
    expect([
      existsSync(stateFolderOf(session)),
      existsSync(join(stateFolderOf(session), '..', '..', session)),
    ]).toStrictEqual([
      false,
      false,
    ]);
  });

  it('should give the digest, keep nothing and warn in one line when no folder can keep the session', () => {
    // Arrange
    const project = createProject({
      config: configOf({}),
    });
    const session = newSession();

    // Act
    const run = runHook({
      event: HookEvent.Startup,
      project,
      root,
      session,
      stateHomeUnset: true,
    });

    // Assert
    expect({
      digest: contextOf(run) !== '',
      exitCode: run.exitCode,
      lines: run.stderr.trimEnd().split('\n').length,
      opensAsTheHook: run.stderr.startsWith('constitution hook: '),
      saved: existsSync(stateFolderOf(session)),
    }).toStrictEqual({
      digest: true,
      exitCode: 0,
      lines: 1,
      opensAsTheHook: true,
      saved: false,
    });
  });
});
