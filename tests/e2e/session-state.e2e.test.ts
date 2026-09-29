import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { contextOf, HookEvent, runHook, warningsOf } from './hook.fixtures';
import { createPluginRoot, removePluginRoots } from './plugin-root.fixtures';
import { configOf, createProject, removeProjects } from './project.fixtures';

const SESSION = 'session-1';

let root = '';
const stateRoots: string[] = [];

const createStateRoot = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-state-'));

  stateRoots.push(folder);

  return folder;
};

const stateOf = (stateRoot: string): string =>
  join(stateRoot, 'droneey-constitution', SESSION);

const recordsOf = (input: {
  kind: string;
  stateRoot: string;
}): readonly (readonly string[])[] =>
  readFileSync(join(stateOf(input.stateRoot), 'active.tsv'), 'utf8')
    .split('\n')
    .map((line) => line.split('\t'))
    .filter((fields) => fields[0] === input.kind);

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();

  for (const folder of stateRoots.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
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
    const stateRoot = createStateRoot();

    // Act
    runHook({
      event: HookEvent.Startup,
      project,
      root,
      session: SESSION,
      tmpDir: stateRoot,
    });

    // Assert
    const active = recordsOf({
      kind: 'active',
      stateRoot,
    }).find((fields) => fields[3] === 'ui');

    expect({
      check: recordsOf({
        kind: 'check',
        stateRoot,
      }),
      files: active?.[5]?.split(' ').includes('blocks/domains/ui/ui.md'),
      governs: active?.[4],
      project: recordsOf({
        kind: 'project',
        stateRoot,
      }),
      reminded: readFileSync(join(stateOf(stateRoot), 'reminded'), 'utf8'),
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
    const stateRoot = createStateRoot();

    // Act
    const run = runHook({
      event: HookEvent.Startup,
      project,
      root,
      session: SESSION,
      tmpDir: stateRoot,
    });

    // Assert
    expect({
      check: recordsOf({
        kind: 'check',
        stateRoot,
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
      session: SESSION,
    },
    {
      condition: 'the session id is not a plain name',
      event: HookEvent.Startup,
      session: '../session-1',
    },
  ])('should save nothing when $condition', ({ event, session }) => {
    // Arrange
    const project = createProject({
      config: configOf({}),
    });
    const stateRoot = createStateRoot();

    // Act
    runHook({
      event,
      project,
      root,
      session,
      tmpDir: stateRoot,
    });

    // Assert
    expect(readdirSync(stateRoot)).toStrictEqual([]);
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
      const stateRoot = createStateRoot();

      runHook({
        event: HookEvent.Startup,
        project,
        root,
        session: SESSION,
        tmpDir: stateRoot,
      });
      writeFileSync(join(stateOf(stateRoot), 'reminded'), 'ui\n');

      // Act
      runHook({
        event,
        project,
        root,
        session: SESSION,
        tmpDir: stateRoot,
      });

      // Assert
      expect({
        reminded: readFileSync(join(stateOf(stateRoot), 'reminded'), 'utf8'),
        saved: existsSync(join(stateOf(stateRoot), 'active.tsv')),
      }).toStrictEqual({
        reminded,
        saved: true,
      });
    },
  );
});
