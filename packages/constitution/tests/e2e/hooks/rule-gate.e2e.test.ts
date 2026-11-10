import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { EXAMPLE_LINE } from '../constitution.fixtures';
import {
  HookEvent,
  isRecord,
  newSession,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { createPluginRoot, distributionOf, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

const SOURCE_FILE = 'src/orders/order-card.ts';

const PART = /^- (\/\S+\.md)$/gmu;
const GROUP = /^## (Vocabulary|MUST rules|SHOULD rules) of /u;
const groupOrder = [
  'Vocabulary',
  'MUST rules',
  'SHOULD rules',
];
const PRINCIPLES = 'blocks/core/@foundation/principles.md';

interface Started {
  readonly project: string;
  readonly session: string;
}

const startSession = (pluginRoot = root): Started => {
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
    root: pluginRoot,
    session,
  });

  return {
    project,
    session,
  };
};

const hookOf = (
  pluginRoot: string,
  script: string,
  event: Readonly<Record<string, unknown>>,
): unknown => {
  const { stdout } = runScript({
    event,
    root: pluginRoot,
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

const editOf = (started: Started, pluginRoot = root): unknown =>
  hookOf(
    pluginRoot,
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
    root,
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
    holdsRules: existsSync(part) && readFileSync(part, 'utf8').includes('\n### '),
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

  it('should refuse a write into folders not made yet until the agent has read the rules that govern it', () => {
    // Arrange
    const started = startSession();
    const path = join(started.project, 'src', 'invoices', 'drafts', 'invoice-card.ts');

    // Act
    const answer = hookOf(
      root,
      'pre-tool-use',
      toolEventOf({
        ...started,
        event: 'PreToolUse',
        path,
        tool: 'Write',
      }),
    );

    // Assert
    expect({
      isMade: existsSync(join(started.project, 'src', 'invoices')),
      parts: placedPartsOf({
        ...started,
        parts: partsOf(answer),
      }),
    }).toStrictEqual({
      isMade: false,
      parts: [
        {
          holdsRules: true,
          isUnderSessions: true,
        },
      ],
    });
  });

  it('should open each part with the vocabularies, then give the statements MUST before SHOULD, with no Why', () => {
    // Arrange
    const started = startSession();

    // Act
    const texts = partsOf(editOf(started)).map((part) => readFileSync(part, 'utf8'));
    const groups = texts.flatMap((text) =>
      text.split('\n').flatMap((line) => GROUP.exec(line)?.[1] ?? []),
    );

    // Assert
    expect({
      groups: [
        ...new Set(groups),
      ],
      holdsWhy: texts.some((text) => text.includes('Why:') || text.includes('#### Why')),
      isOrdered: groups.every(
        (group, index) =>
          index === 0 || groupOrder.indexOf(group) >= groupOrder.indexOf(groups[index - 1] ?? ''),
      ),
    }).toStrictEqual({
      groups: groupOrder,
      holdsWhy: false,
      isOrdered: true,
    });
  });

  it('should hand a rule without its Why and Examples, and ask for nothing again when only they changed', () => {
    // Arrange
    const pluginRoot = createPluginRoot();
    const principles = `${distributionOf(pluginRoot)}/${PRINCIPLES}`;
    const started = startSession(pluginRoot);
    const parts = partsOf(editOf(started, pluginRoot));
    const handed = parts.map((part) => readFileSync(part, 'utf8')).join('\n');

    readAll({
      ...started,
      parts,
    });
    writeFileSync(
      principles,
      readFileSync(principles, 'utf8')
        .replaceAll('it keeps the fixture honest.', 'a fixture that drifts tests nothing.')
        .replaceAll(EXAMPLE_LINE, 'const exampleChanged = true;'),
    );

    // Act
    const retried = editOf(started, pluginRoot);

    // Assert
    expect({
      holdsExample: handed.includes(EXAMPLE_LINE),
      holdsRule: handed.includes('### names-reveal-intent '),
      holdsWhy: handed.includes('it keeps the fixture honest.'),
      retried,
    }).toStrictEqual({
      holdsExample: false,
      holdsRule: true,
      holdsWhy: false,
      retried: undefined,
    });
  });
});
