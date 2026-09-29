import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  contextOf,
  HookEvent,
  newSession,
  removeSessions,
  runHook,
  stateFolderOf,
  warningsOf,
} from './hook.fixtures';
import { createPluginRoot, removePluginRoots } from './plugin-root.fixtures';
import { configOf, createProject, removeProjects } from './project.fixtures';

let root = '';

const recordsOf = (input: {
  kind: string;
  session: string;
}): readonly (readonly string[])[] =>
  readFileSync(join(stateFolderOf(input.session), 'active.tsv'), 'utf8')
    .split('\n')
    .map((line) => line.split('\t'))
    .filter((fields) => fields[0] === input.kind);

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
  it('should save the project, the check command and each active block with its globs and files when a session starts', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        domains: '[ui]',
      }),
    });
    const session = newSession();

    // Act
    runHook({
      event: HookEvent.Startup,
      project,
      root,
      session,
    });

    // Assert
    const active = recordsOf({
      kind: 'active',
      session,
    }).find((fields) => fields[3] === 'ui');

    expect({
      check: recordsOf({
        kind: 'check',
        session,
      }),
      files: active?.[5]?.split(' ').includes('blocks/domains/ui/ui.md'),
      governs: active?.[4],
      project: recordsOf({
        kind: 'project',
        session,
      }),
      reminded: readFileSync(join(stateFolderOf(session), 'reminded'), 'utf8'),
    }).toStrictEqual({
      check: [
        [
          'check',
          'bun run check',
        ],
      ],
      files: true,
      governs: '**/ui/** **/components/** styles/*.{css,scss}',
      project: [
        [
          'project',
          realpathSync(project),
        ],
      ],
      reminded: '',
    });
  });

  it('should save no check command and warn of none when check is null', () => {
    // Arrange
    const project = createProject({
      config: configOf({
        check: 'null',
      }),
    });
    const session = newSession();

    // Act
    const run = runHook({
      event: HookEvent.Startup,
      project,
      root,
      session,
    });

    // Assert
    expect({
      check: recordsOf({
        kind: 'check',
        session,
      }),
      warnings: warningsOf(contextOf(run)),
    }).toStrictEqual({
      check: [
        [
          'check',
          '',
        ],
      ],
      warnings: [],
    });
  });

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

  it.each([
    {
      event: HookEvent.Resume,
      reminded: 'ui\n',
    },
    {
      event: HookEvent.Clear,
      reminded: '',
    },
    {
      event: HookEvent.Compact,
      reminded: '',
    },
  ])(
    'should keep what was reminded only when a session resumes, not on $event',
    ({ event, reminded }) => {
      // Arrange
      const project = createProject({
        config: configOf({
          domains: '[ui]',
        }),
      });
      const session = newSession();

      runHook({
        event: HookEvent.Startup,
        project,
        root,
        session,
      });
      writeFileSync(join(stateFolderOf(session), 'reminded'), 'ui\n');

      // Act
      runHook({
        event,
        project,
        root,
        session,
      });

      // Assert
      expect({
        reminded: readFileSync(
          join(stateFolderOf(session), 'reminded'),
          'utf8',
        ),
        saved: existsSync(join(stateFolderOf(session), 'active.tsv')),
      }).toStrictEqual({
        reminded,
        saved: true,
      });
    },
  );
});
