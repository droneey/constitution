import { execFileSync } from 'node:child_process';
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import type { HookRun } from '../hook.fixtures';
import {
  HookEvent,
  isRecord,
  mentionedOf,
  newSession,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { toolEnvironment } from '../package.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, Repository, removeProjects } from '../project.fixtures';

enum StopEvent {
  Stop = 'Stop',
  Subagent = 'SubagentStop',
}

interface Session {
  id: string;
  project: string;
}

const CHECK = 'constitution run check';
// What the gate says: its decision, or a review asked for in a system message,
// then the names it gives, the check to run or the blocks the changes fall under.
const NOTHING: readonly string[] = [] as const;
const BLOCKED: readonly string[] = [
  'block',
  CHECK,
] as const;
const REVIEW: readonly string[] = [
  'review',
  'ui',
] as const;

const gateOf = (stdout: string): readonly string[] => {
  const parsed: unknown = stdout === '' ? {} : JSON.parse(stdout);
  const { decision, reason, systemMessage } = isRecord(parsed) ? parsed : {};

  if (typeof decision === 'string') {
    return [
      decision,
      ...mentionedOf({
        names: [
          CHECK,
        ],
        text: String(reason),
      }),
    ];
  }

  return typeof systemMessage === 'string'
    ? [
        'review',
        ...mentionedOf({
          names: [
            'ui',
          ],
          text: systemMessage,
        }),
      ]
    : NOTHING;
};

let root = '';

const git = (input: { args: readonly string[]; project: string }): void => {
  execFileSync(
    'git',
    [
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      ...input.args,
    ],
    {
      cwd: input.project,
      env: toolEnvironment(),
    },
  );
};

const startSession = (config: string): Session => {
  const project = realpathSync(
    createProject({
      config,
    }),
  );
  const id = newSession();

  git({
    args: [
      'add',
      '.',
    ],
    project,
  });
  git({
    args: [
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'base',
    ],
    project,
  });
  runHook({
    event: HookEvent.Startup,
    project,
    root,
    session: id,
  });

  return {
    id,
    project,
  };
};

const write = (input: { path: string; project: string }): void => {
  mkdirSync(dirname(join(input.project, input.path)), {
    recursive: true,
  });
  writeFileSync(join(input.project, input.path), 'export {};\n');
};

const fire = (input: {
  event: string;
  fields?: Readonly<Record<string, unknown>>;
  script: string;
  session: Session;
}): HookRun =>
  runScript({
    event: Object.fromEntries([
      [
        'hook_event_name',
        input.event,
      ],
      [
        'session_id',
        input.session.id,
      ],
      ...Object.entries(input.fields ?? {}),
    ]),
    root,
    script: input.script,
  });

const prompt = (session: Session): HookRun =>
  fire({
    event: 'UserPromptSubmit',
    script: 'user-prompt-submit.sh',
    session,
  });

const ran = (input: { command: string; session: Session }): HookRun =>
  fire({
    event: 'PostToolUse',
    fields: Object.fromEntries([
      [
        'tool_name',
        'Bash',
      ],
      [
        'tool_input',
        Object.fromEntries([
          [
            'command',
            input.command,
          ],
        ]),
      ],
    ]),
    script: 'record-check.sh',
    session: input.session,
  });

const stop = (input: {
  active?: boolean;
  event?: StopEvent;
  session: Session;
}): readonly string[] =>
  gateOf(
    fire({
      event: input.event ?? StopEvent.Stop,
      fields: Object.fromEntries([
        [
          'stop_hook_active',
          input.active === true,
        ],
      ]),
      script: 'stop.sh',
      session: input.session,
    }).stdout.trim(),
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

describe('the hand-back gate', () => {
  it('should let the agent stop when nothing changed', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should block once and then ask for a review when files changed and the check did not run', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });

    // Act
    const first = stop({
      session,
    });

    // Assert
    expect(first).toStrictEqual(BLOCKED);

    // Act
    const second = stop({
      session,
    });

    // Assert
    expect(second).toStrictEqual(REVIEW);
  });

  it('should let the agent stop when the check passed on the changed tree', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });
    ran({
      command: `${CHECK} && echo done`,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should block again when the tree changed after the check passed', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });
    write({
      path: 'src/other.ts',
      project: session.project,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(BLOCKED);
  });

  it.each([
    'constitution run checkout',
    'echo constitution run check',
  ])('should block when the command run was %s, not the check', (command) => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });
    ran({
      command,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(BLOCKED);
  });

  it('should say nothing about a review when no active block governs the changed files', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should not ask for a review when the reviewer reviewed the changed tree', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });
    fire({
      event: StopEvent.Subagent,
      fields: Object.fromEntries([
        [
          'agent_type',
          'constitution:reviewer',
        ],
      ]),
      script: 'stop.sh',
      session,
    });

    // Act
    const output = stop({
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should let a subagent stop without asking for a review when the check passed', () => {
    // Arrange
    const session = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    prompt(session);
    write({
      path: 'src/features/orders/ui/order-card.tsx',
      project: session.project,
    });
    ran({
      command: CHECK,
      session,
    });

    // Act
    const output = stop({
      event: StopEvent.Subagent,
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should let the agent stop when a block of this hook is being answered', () => {
    // Arrange
    const session = startSession(configOf({}));

    prompt(session);
    write({
      path: 'src/main.ts',
      project: session.project,
    });

    // Act
    const output = stop({
      active: true,
      session,
    });

    // Assert
    expect(output).toStrictEqual(NOTHING);
  });

  it('should say nothing at any stop when the project lies in no repository', () => {
    // Arrange
    const project = realpathSync(
      createProject({
        config: configOf({}),
        repository: Repository.None,
      }),
    );
    const session = {
      id: newSession(),
      project,
    };

    runHook({
      event: HookEvent.Startup,
      project,
      root,
      session: session.id,
    });
    prompt(session);
    write({
      path: 'src/main.ts',
      project,
    });

    // Act
    const subagent = fire({
      event: StopEvent.Subagent,
      script: 'stop.sh',
      session,
    });

    // Assert
    expect(subagent.stdout).toBe('');

    // Act
    const main = fire({
      event: StopEvent.Stop,
      script: 'stop.sh',
      session,
    });

    // Assert
    expect(main.stdout).toBe('');
  });
});
