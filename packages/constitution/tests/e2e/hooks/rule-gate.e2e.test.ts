import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  HookEvent,
  isRecord,
  newSession,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

const SOURCE_FILE = 'src/orders/order-card.ts';

const PART = /^- (\/\S+\.md)$/gmu;

interface Started {
  readonly project: string;
  readonly session: string;
}

const startSession = (): Started => {
  const project = createProject({
    config: configOf({
      domains: '[ui]',
      languages: '[typescript]',
    }),
    files: {
      [SOURCE_FILE]: 'export const total = 1;\n',
    },
  });
  const session = newSession();

  runHook({
    event: HookEvent.Startup,
    project,
    root,
    session,
  });

  return {
    project,
    session,
  };
};

const hookOf = (script: string, event: Readonly<Record<string, unknown>>): unknown => {
  const { stdout } = runScript({
    event,
    root,
    script,
  });

  return stdout === '' ? undefined : JSON.parse(stdout);
};

const toolEventOf = (
  call: Started & {
    event: string;
    path: string;
    tool: string;
  },
): Readonly<Record<string, unknown>> =>
  Object.fromEntries([
    [
      'cwd',
      call.project,
    ],
    [
      'hook_event_name',
      call.event,
    ],
    [
      'session_id',
      call.session,
    ],
    [
      'tool_input',
      Object.fromEntries([
        [
          'file_path',
          call.path,
        ],
      ]),
    ],
    [
      'tool_name',
      call.tool,
    ],
  ]);

const editOf = (started: Started): unknown =>
  hookOf(
    'pre-tool-use',
    toolEventOf({
      ...started,
      event: 'PreToolUse',
      path: join(started.project, SOURCE_FILE),
      tool: 'Edit',
    }),
  );

const readOf = (
  input: Started & {
    path: string;
  },
): unknown =>
  hookOf(
    'post-tool-use',
    toolEventOf({
      ...input,
      event: 'PostToolUse',
      tool: 'Read',
    }),
  );

const partsOf = (answer: unknown): readonly string[] => {
  const output = isRecord(answer) ? answer['hookSpecificOutput'] : undefined;
  const reason = isRecord(output) ? output['permissionDecisionReason'] : undefined;

  return typeof reason === 'string'
    ? [
        ...reason.matchAll(PART),
      ].map((match) => match[1] ?? '')
    : [];
};

const placedPartsOf = (
  input: Started & {
    parts: readonly string[];
  },
): readonly unknown[] =>
  input.parts.map((part) => ({
    holdsRules: existsSync(part) && readFileSync(part, 'utf8').includes('<!-- rule '),
    isUnderSessions: part.startsWith(join(input.project, '.droneey', 'constitution-sessions')),
  }));

const readAll = (
  input: Started & {
    parts: readonly string[];
  },
): readonly unknown[] =>
  input.parts.map((path) =>
    readOf({
      ...input,
      path,
    }),
  );

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

describe('the rule gate', () => {
  it('should refuse an edit until the agent has read the rules that govern it, then allow it', () => {
    // Arrange
    const started = startSession();

    // Act
    const parts = partsOf(editOf(started));

    // Assert
    expect(
      placedPartsOf({
        ...started,
        parts,
      }),
    ).toStrictEqual([
      {
        holdsRules: true,
        isUnderSessions: true,
      },
    ]);

    // Act
    const answers = readAll({
      ...started,
      parts,
    });

    // Assert
    expect(answers).toStrictEqual([
      undefined,
    ]);

    // Act
    const retried = editOf(started);

    // Assert
    expect(retried).toBeUndefined();
  });
});
